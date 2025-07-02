import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { createAnthropic } from '@ai-sdk/anthropic';
import { createOpenAI } from '@ai-sdk/openai';
import { CoreMessage, generateObject, generateText } from 'ai';
import { Repository } from 'typeorm';

import {
  ModelId,
  ModelProvider,
} from 'src/engine/core-modules/ai/constants/ai-models.const';
import { getAIModelById } from 'src/engine/core-modules/ai/utils/get-ai-model-by-id';
import { TwentyConfigService } from 'src/engine/core-modules/twenty-config/twenty-config.service';
import { AgentChatMessagesEntity } from 'src/engine/metadata-modules/agent/agent-chat-message.entity';
import { AgentToolService } from 'src/engine/metadata-modules/agent/agent-tool.service';
import { AGENT_CONFIG } from 'src/engine/metadata-modules/agent/constants/agent-config.const';
import { AGENT_SYSTEM_PROMPTS } from 'src/engine/metadata-modules/agent/constants/agent-system-prompts.const';
import { convertOutputSchemaToZod } from 'src/engine/metadata-modules/agent/utils/convert-output-schema-to-zod';
import { OutputSchema } from 'src/modules/workflow/workflow-builder/workflow-schema/types/output-schema.type';
import { resolveInput } from 'src/modules/workflow/workflow-executor/utils/variable-resolver.util';

import { AgentEntity } from './agent.entity';
import { AgentException, AgentExceptionCode } from './agent.exception';

export interface AgentExecutionResult {
  result: {
    textResponse: string;
    structuredOutput?: object;
  };
  usage: {
    promptTokens: number;
    completionTokens: number;
    totalTokens: number;
  };
}

@Injectable()
export class AgentExecutionService {
  constructor(
    private readonly twentyConfigService: TwentyConfigService,
    private readonly agentToolService: AgentToolService,
    @InjectRepository(AgentEntity, 'core')
    private readonly agentRepository: Repository<AgentEntity>,
    @InjectRepository(AgentChatMessagesEntity, 'core')
    private readonly agentChatmessageRepository: Repository<AgentChatMessagesEntity>,
  ) {}

  private getModel = (modelId: ModelId, provider: ModelProvider) => {
    switch (provider) {
      case ModelProvider.OPENAI: {
        const OpenAIProvider = createOpenAI({
          apiKey: this.twentyConfigService.get('OPENAI_API_KEY'),
        });

        return OpenAIProvider(modelId);
      }
      case ModelProvider.ANTHROPIC: {
        const AnthropicProvider = createAnthropic({
          apiKey: this.twentyConfigService.get('ANTHROPIC_API_KEY'),
        });

        return AnthropicProvider(modelId);
      }
      default:
        throw new AgentException(
          `Unsupported provider: ${provider}`,
          AgentExceptionCode.AGENT_EXECUTION_FAILED,
        );
    }
  };

  private async validateApiKey(provider: ModelProvider): Promise<void> {
    let apiKey: string | undefined;

    switch (provider) {
      case ModelProvider.OPENAI:
        apiKey = this.twentyConfigService.get('OPENAI_API_KEY');
        break;
      case ModelProvider.ANTHROPIC:
        apiKey = this.twentyConfigService.get('ANTHROPIC_API_KEY');
        break;
      default:
        throw new AgentException(
          `Unsupported provider: ${provider}`,
          AgentExceptionCode.AGENT_EXECUTION_FAILED,
        );
    }
    if (!apiKey) {
      throw new AgentException(
        `${provider.toUpperCase()} API key not configured`,
        AgentExceptionCode.API_KEY_NOT_CONFIGURED,
      );
    }
  }

  async getChatResponse({
    agentId,
    userMessage,
    messages,
  }: {
    agentId: string;
    userMessage: string;
    messages: AgentChatMessagesEntity[];
  }): Promise<string> {
    const agent = await this.agentRepository.findOneOrFail({
      where: { id: agentId },
    });
    const aiModel = getAIModelById(agent.modelId);

    if (!aiModel) {
      throw new AgentException(
        `AI model with id ${agent.modelId} not found`,
        AgentExceptionCode.AGENT_EXECUTION_FAILED,
      );
    }
    const provider = aiModel.provider;

    await this.validateApiKey(provider);

    let llmMessages: CoreMessage[] = [];

    console.log('messages', messages);

    llmMessages = messages.map((msg) => ({
      role: msg.sender === 'user' ? 'user' : 'assistant',
      content: msg.message,
    }));
    llmMessages.push({ role: 'user', content: userMessage });

    const textResponse = await generateText({
      system: AGENT_SYSTEM_PROMPTS.AGENT_CHAT,
      model: this.getModel(agent.modelId, provider),
      messages: llmMessages,
      maxSteps: AGENT_CONFIG.MAX_STEPS,
    });

    return textResponse.text;
  }

  async executeAgent({
    agent,
    context,
    schema,
  }: {
    agent: AgentEntity;
    context: Record<string, unknown>;
    schema: OutputSchema;
  }): Promise<AgentExecutionResult> {
    try {
      const aiModel = getAIModelById(agent.modelId);

      if (!aiModel) {
        throw new AgentException(
          `AI model with id ${agent.modelId} not found`,
          AgentExceptionCode.AGENT_EXECUTION_FAILED,
        );
      }
      const provider = aiModel.provider;

      await this.validateApiKey(provider);
      const tools = await this.agentToolService.generateToolsForAgent(
        agent.id,
        agent.workspaceId,
      );
      const textResponse = await generateText({
        system: AGENT_SYSTEM_PROMPTS.AGENT_EXECUTION,
        model: this.getModel(agent.modelId, provider),
        prompt: resolveInput(agent.prompt, context) as string,
        tools,
        maxSteps: AGENT_CONFIG.MAX_STEPS,
      });

      if (Object.keys(schema).length === 0) {
        return {
          result: { textResponse: textResponse.text },
          usage: textResponse.usage,
        };
      }
      const output = await generateObject({
        system: AGENT_SYSTEM_PROMPTS.OUTPUT_GENERATOR,
        model: this.getModel(agent.modelId, provider),
        prompt: `Based on the following execution results, generate the structured output according to the schema:

                 Execution Results: ${textResponse.text}

                 Please generate the structured output based on the execution results and context above.`,
        schema: convertOutputSchemaToZod(schema),
      });

      return {
        result: {
          textResponse: textResponse.text,
          structuredOutput: output.object,
        },
        usage: {
          promptTokens:
            (textResponse.usage?.promptTokens ?? 0) +
            (output.usage?.promptTokens ?? 0),
          completionTokens:
            (textResponse.usage?.completionTokens ?? 0) +
            (output.usage?.completionTokens ?? 0),
          totalTokens:
            (textResponse.usage?.totalTokens ?? 0) +
            (output.usage?.totalTokens ?? 0),
        },
      };
    } catch (error) {
      if (error instanceof AgentException) {
        throw error;
      }
      throw new AgentException(
        error instanceof Error ? error.message : 'Agent execution failed',
        AgentExceptionCode.AGENT_EXECUTION_FAILED,
      );
    }
  }
}
