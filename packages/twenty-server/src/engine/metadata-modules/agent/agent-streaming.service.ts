import { Injectable, Logger } from '@nestjs/common';
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
import { Workspace } from 'src/engine/core-modules/workspace/workspace.entity';
import { RecordIdsByObjectMetadataNameSingularType } from 'src/engine/metadata-modules/agent/types/recordIdsByObjectMetadataNameSingular.type';

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
    @InjectRepository(AgentChatThreadEntity, 'core')
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

      let aiResponse = '';

      for await (const chunk of fullStream) {
        switch (chunk.type) {
          case 'text-delta':
            aiResponse += chunk.textDelta;
            this.sendStreamEvent(res, {
              type: chunk.type,
              message: chunk.textDelta,
            });
            break;
          case 'tool-call':
            this.sendStreamEvent(res, {
              type: chunk.type,
              message: chunk.args?.toolDescription,
            });
            break;
          case 'error':
            {
              const errorMessage =
                chunk.error &&
                typeof chunk.error === 'object' &&
                'message' in chunk.error
                  ? chunk.error.message
                  : 'Something went wrong. Please try again.';

              this.sendStreamEvent(res, {
                type: 'error',
                message: errorMessage as string,
              });
              res.end();
            }
            this.logger.error(`Stream error: ${JSON.stringify(chunk)}`);
            break;
          default:
            this.logger.log(`Unknown chunk type: ${chunk.type}`);
            break;
        }
      }

      if (!aiResponse) {
        res.end();

        return;
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
      });

      res.end();
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error occurred';

      if (error instanceof AgentException) {
        this.logger.error(`Agent Exception Code: ${error.code}`);
      }

      if (!res.headersSent) {
        this.setupStreamingHeaders(res);
      }

      this.sendStreamEvent(res, {
        type: 'error',
        message: errorMessage,
      });

      res.end();
    }
  }

  private sendStreamEvent(
    res: Response,
    event: { type: string; message: string },
  ): void {
    res.write(JSON.stringify(event) + '\n');
  }

  private setupStreamingHeaders(res: Response): void {
    res.setHeader('Content-Type', 'text/plain; charset=utf-8');
    res.setHeader('Transfer-Encoding', 'chunked');
    res.setHeader('Cache-Control', 'no-cache');
  }
}
