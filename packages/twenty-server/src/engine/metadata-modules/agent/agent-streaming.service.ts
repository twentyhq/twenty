import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { Response } from 'express';
import { Repository } from 'typeorm';

import { AgentChatMessageRole } from 'src/engine/metadata-modules/agent/agent-chat-message.entity';
import { AgentChatThreadEntity } from 'src/engine/metadata-modules/agent/agent-chat-thread.entity';
import { AgentChatService } from 'src/engine/metadata-modules/agent/agent-chat.service';
import { AgentExecutionService } from 'src/engine/metadata-modules/agent/agent-execution.service';
import {
  AgentException,
  AgentExceptionCode,
} from 'src/engine/metadata-modules/agent/agent.exception';

export type StreamAgentChatOptions = {
  threadId: string;
  userMessage: string;
  userWorkspaceId: string;
  res: Response;
};

export type StreamAgentChatResult = {
  success: boolean;
  error?: string;
  aiResponse?: string;
};

@Injectable()
export class AgentStreamingService {
  constructor(
    @InjectRepository(AgentChatThreadEntity, 'core')
    private readonly threadRepository: Repository<AgentChatThreadEntity>,
    private readonly agentChatService: AgentChatService,
    private readonly agentExecutionService: AgentExecutionService,
  ) {}

  async streamAgentChat({
    threadId,
    userMessage,
    userWorkspaceId,
    res,
  }: StreamAgentChatOptions) {
    try {
      const thread = await this.threadRepository.findOne({
        where: {
          id: threadId,
          userWorkspaceId,
        },
        relations: ['messages', 'agent'],
      });

      if (!thread) {
        throw new AgentException(
          'Thread not found',
          AgentExceptionCode.AGENT_EXECUTION_FAILED,
        );
      }

      await this.agentChatService.addMessage({
        threadId,
        role: AgentChatMessageRole.USER,
        content: userMessage,
      });

      this.setupStreamingHeaders(res);

      const { textStream } =
        await this.agentExecutionService.streamChatResponse({
          agentId: thread.agent.id,
          userMessage,
          messages: thread.messages,
        });

      let aiResponse = '';

      for await (const chunk of textStream) {
        aiResponse += chunk;
        res.write(chunk);
      }

      await this.agentChatService.addMessage({
        threadId,
        role: AgentChatMessageRole.ASSISTANT,
        content: aiResponse,
      });

      res.end();
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error occurred';

      return { success: false, error: errorMessage };
    }
  }

  private setupStreamingHeaders(res: Response): void {
    res.setHeader('Content-Type', 'text/plain; charset=utf-8');
    res.setHeader('Transfer-Encoding', 'chunked');
    res.setHeader('Cache-Control', 'no-cache');
  }
}
