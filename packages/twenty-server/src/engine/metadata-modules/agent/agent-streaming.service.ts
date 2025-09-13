import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { type Response } from 'express';
import { Repository } from 'typeorm';

import { type Workspace } from 'src/engine/core-modules/workspace/workspace.entity';
import { AgentChatMessageRole } from 'src/engine/metadata-modules/agent/agent-chat-message.entity';
import { AgentChatThreadEntity } from 'src/engine/metadata-modules/agent/agent-chat-thread.entity';
import { AgentChatService } from 'src/engine/metadata-modules/agent/agent-chat.service';
import { AgentExecutionService } from 'src/engine/metadata-modules/agent/agent-execution.service';
import {
  AgentException,
  AgentExceptionCode,
} from 'src/engine/metadata-modules/agent/agent.exception';
import { type RecordIdsByObjectMetadataNameSingularType } from 'src/engine/metadata-modules/agent/types/recordIdsByObjectMetadataNameSingular.type';

export type StreamAgentChatOptions = {
  threadId: string;
  userMessage: string;
  userWorkspaceId: string;
  workspace: Workspace;
  fileIds: string[];
  recordIdsByObjectMetadataNameSingular: RecordIdsByObjectMetadataNameSingularType;
  res: Response;
};

@Injectable()
export class AgentStreamingService {
  private readonly logger = new Logger(AgentStreamingService.name);

  constructor(
    @InjectRepository(AgentChatThreadEntity)
    private readonly threadRepository: Repository<AgentChatThreadEntity>,
    private readonly agentChatService: AgentChatService,
    private readonly agentExecutionService: AgentExecutionService,
  ) {}

  async streamAgentChat({
    threadId,
    userMessage,
    userWorkspaceId,
    workspace,
    fileIds,
    recordIdsByObjectMetadataNameSingular,
    res,
  }: StreamAgentChatOptions) {
    let rawStreamString = '';
    let aiResponse = '';

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

      this.setupStreamingHeaders(res);

      const { fullStream } =
        await this.agentExecutionService.streamChatResponse({
          workspace,
          agentId: thread.agent.id,
          userWorkspaceId,
          userMessage,
          messages: thread.messages,
          fileIds,
          recordIdsByObjectMetadataNameSingular,
        });

      for await (const chunk of fullStream) {
        rawStreamString += JSON.stringify(chunk) + '\n';

        if (chunk.type === 'text-delta') {
          aiResponse += chunk.text;
        }

        this.sendStreamEvent(
          res,
          [
            'text-delta',
            'reasoning',
            'reasoning-signature',
            'tool-call',
            'tool-result',
            'error',
          ].includes(chunk.type)
            ? chunk
            : { type: chunk.type },
        );
      }
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error occurred';

      if (error instanceof AgentException) {
        this.logger.error(`Agent Exception Code: ${error.code}`);
      }

      if (!res.headersSent) {
        this.setupStreamingHeaders(res);
      }

      const errorChunk = {
        type: 'error',
        message: errorMessage,
      };

      rawStreamString += JSON.stringify(errorChunk) + '\n';

      this.sendStreamEvent(res, errorChunk);
    }

    await this.agentChatService.addMessage({
      threadId,
      role: AgentChatMessageRole.USER,
      content: userMessage,
      fileIds,
    });

    await this.agentChatService.addMessage({
      threadId,
      role: AgentChatMessageRole.ASSISTANT,
      content: aiResponse,
      streamData: rawStreamString.trim() || null,
    });

    res.end();
  }

  private sendStreamEvent(res: Response, event: object): void {
    res.write(JSON.stringify(event) + '\n');
  }

  private setupStreamingHeaders(res: Response): void {
    res.setHeader('Content-Type', 'text/plain; charset=utf-8');
    res.setHeader('Transfer-Encoding', 'chunked');
    res.setHeader('Cache-Control', 'no-cache');
  }
}
