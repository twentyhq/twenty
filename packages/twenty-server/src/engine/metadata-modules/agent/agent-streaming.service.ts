import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { CoreMessage, streamText } from 'ai';
import { Response } from 'express';
import { Repository } from 'typeorm';

import {
    AIModelConfig,
    ModelProvider,
} from 'src/engine/core-modules/ai/constants/ai-models.const';
import { getAIModelById } from 'src/engine/core-modules/ai/utils/get-ai-model-by-id';
import { AgentChatMessageRole } from 'src/engine/metadata-modules/agent/agent-chat-message.entity';
import { AgentChatThreadEntity } from 'src/engine/metadata-modules/agent/agent-chat-thread.entity';
import { AgentChatService } from 'src/engine/metadata-modules/agent/agent-chat.service';
import { AgentExecutionService } from 'src/engine/metadata-modules/agent/agent-execution.service';
import { AgentToolService } from 'src/engine/metadata-modules/agent/agent-tool.service';

import { AGENT_CONFIG } from './constants/agent-config.const';
import { AGENT_SYSTEM_PROMPTS } from './constants/agent-system-prompts.const';

export interface StreamAgentChatOptions {
  threadId: string;
  userMessage: string;
  res: Response;
}

export interface StreamAgentChatResult {
  success: boolean;
  error?: string;
  aiResponse?: string;
}

interface AIContext {
  aiModel: AIModelConfig;
  provider: ModelProvider;
  llmMessages: CoreMessage[];
}

@Injectable()
export class AgentStreamingService {
  constructor(
    @InjectRepository(AgentChatThreadEntity, 'core')
    private readonly threadRepository: Repository<AgentChatThreadEntity>,
    private readonly agentChatService: AgentChatService,
    private readonly agentToolService: AgentToolService,
    private readonly agentExecutionService: AgentExecutionService,
  ) {}

  async streamAgentChat({
    threadId,
    userMessage,
    res,
  }: StreamAgentChatOptions): Promise<StreamAgentChatResult> {
    try {
      const thread = await this.threadRepository.findOneOrFail({
        where: { id: threadId },
        relations: ['messages', 'agent'],
      });

      await this.agentChatService.addMessage({
        threadId,
        role: AgentChatMessageRole.USER,
        content: userMessage,
      });

      const aiContext = this.prepareAIContext(thread, userMessage);

      this.setupStreamingHeaders(res);

      const tools = await this.agentToolService.generateToolsForAgent(
        thread.agent.id,
        thread.agent.workspaceId,
      );

      const aiResponse = await this.streamAIResponse(aiContext, tools, res);

      await this.agentChatService.addMessage({
        threadId,
        role: AgentChatMessageRole.ASSISTANT,
        content: aiResponse,
      });

      return { success: true, aiResponse };
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error occurred';

      return { success: false, error: errorMessage };
    }
  }

  private prepareAIContext(
    thread: AgentChatThreadEntity,
    userMessage: string,
  ): AIContext {
    const aiModel = getAIModelById(thread.agent.modelId);

    if (!aiModel) {
      throw new Error(`AI model with id ${thread.agent.modelId} not found`);
    }

    const provider = aiModel.provider;

    const llmMessages: CoreMessage[] = thread.messages.map(
      ({ role, content }) => ({
        role,
        content,
      }),
    );

    llmMessages.push({ role: 'user', content: userMessage });

    return { aiModel, provider, llmMessages };
  }

  private setupStreamingHeaders(res: Response): void {
    res.setHeader('Content-Type', 'text/plain; charset=utf-8');
    res.setHeader('Transfer-Encoding', 'chunked');
    res.setHeader('Cache-Control', 'no-cache');
  }

  private async streamAIResponse(
    aiContext: AIContext,
    tools: Awaited<
      ReturnType<typeof this.agentToolService.generateToolsForAgent>
    >,
    res: Response,
  ): Promise<string> {
    let aiTextResponse = '';

    const { textStream } = streamText({
      system: AGENT_SYSTEM_PROMPTS.AGENT_CHAT,
      model: this.agentExecutionService.getModel(
        aiContext.aiModel.modelId,
        aiContext.provider,
      ),
      messages: aiContext.llmMessages,
      maxSteps: AGENT_CONFIG.MAX_STEPS,
      tools,
    });

    for await (const chunk of textStream) {
      aiTextResponse += chunk;
      res.write(chunk);
    }

    res.end();

    return aiTextResponse;
  }
}
