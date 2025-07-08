import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { createAnthropic } from '@ai-sdk/anthropic';
import { createOpenAI } from '@ai-sdk/openai';
import { CoreMessage, generateObject, generateText, streamText } from 'ai';
import { Repository } from 'typeorm';

import {
  ModelId,
  ModelProvider,
} from 'src/engine/core-modules/ai/constants/ai-models.const';
import { getAIModelById } from 'src/engine/core-modules/ai/utils/get-ai-model-by-id';
import { TwentyConfigService } from 'src/engine/core-modules/twenty-config/twenty-config.service';
import {
  AgentChatMessageEntity,
  AgentChatMessageRole,
} from 'src/engine/metadata-modules/agent/agent-chat-message.entity';
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
    @InjectRepository(AgentChatMessageEntity, 'core')
    private readonly agentChatmessageRepository: Repository<AgentChatMessageEntity>,
  ) {}

  getModel = (modelId: ModelId, provider: ModelProvider) => {
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

  async prepareAIRequestConfig({
    messages,
    prompt,
    system,
    agent,
  }: {
    system: string;
    agent: AgentEntity;
    prompt?: string;
    messages?: CoreMessage[];
  }) {
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

    return {
      system,
      tools,
      model: this.getModel(agent.modelId, aiModel.provider),
      ...(messages && { messages }),
      ...(prompt && { prompt }),
      maxSteps: AGENT_CONFIG.MAX_STEPS,
    };
  }

  async streamChatResponse({
    agentId,
    userMessage,
    messages,
  }: {
    agentId: string;
    userMessage: string;
    messages: AgentChatMessageEntity[];
  }) {
    const agent = await this.agentRepository.findOneOrFail({
      where: { id: agentId },
    });

    const llmMessages: CoreMessage[] = messages.map(({ role, content }) => ({
      role,
      content,
    }));

    llmMessages.push({
      role: AgentChatMessageRole.USER,
      content: userMessage,
    });

    const aiRequestConfig = await this.prepareAIRequestConfig({
      system: `${AGENT_SYSTEM_PROMPTS.AGENT_CHAT}\n\n${agent.prompt}`,
      agent,
      messages: llmMessages,
    });

    return streamText(aiRequestConfig);
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
      const aiRequestConfig = await this.prepareAIRequestConfig({
        system: AGENT_SYSTEM_PROMPTS.AGENT_EXECUTION,
        agent,
        prompt: resolveInput(agent.prompt, context) as string,
      });
      const textResponse = await generateText(aiRequestConfig);

      if (Object.keys(schema).length === 0) {
        return {
          result: { textResponse: textResponse.text },
          usage: textResponse.usage,
        };
      }
      const output = await generateObject({
        system: AGENT_SYSTEM_PROMPTS.OUTPUT_GENERATOR,
        model: aiRequestConfig.model,
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
