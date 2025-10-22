import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import {
  createUIMessageStream,
  pipeUIMessageStreamToResponse,
  UIDataTypes,
  UIMessage,
  UITools,
} from 'ai';
import { type Response } from 'express';
import { ExtendedUIMessage } from 'twenty-shared/ai';
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
import { AiRouterService } from 'src/engine/metadata-modules/ai-router/ai-router.service';

export type StreamAgentChatOptions = {
  threadId: string;
  userWorkspaceId: string;
  workspace: Workspace;
  recordIdsByObjectMetadataNameSingular: RecordIdsByObjectMetadataNameSingularType;
  response: Response;
  messages: UIMessage<unknown, UIDataTypes, UITools>[];
};

@Injectable()
export class AgentStreamingService {
  private readonly logger = new Logger(AgentStreamingService.name);

  constructor(
    @InjectRepository(AgentChatThreadEntity)
    private readonly threadRepository: Repository<AgentChatThreadEntity>,
    private readonly agentChatService: AgentChatService,
    private readonly agentExecutionService: AgentExecutionService,
    private readonly aiRouterService: AiRouterService,
  ) {}

  async streamAgentChat({
    threadId,
    userWorkspaceId,
    workspace,
    messages,
    recordIdsByObjectMetadataNameSingular,
    response,
  }: StreamAgentChatOptions) {
    try {
      const thread = await this.threadRepository.findOne({
        where: {
          id: threadId,
          userWorkspaceId,
        },
        relations: ['messages'],
      });

      if (!thread) {
        throw new AgentException(
          'Thread not found',
          AgentExceptionCode.AGENT_EXECUTION_FAILED,
        );
      }

      const stream = createUIMessageStream<ExtendedUIMessage>({
        execute: async ({ writer }) => {
          writer.write({
            type: 'data-routing-status' as const,
            id: 'routing-status',
            data: {
              text: 'Finding the best agent for your request...',
              state: 'loading',
            },
          });

          const agent = await this.aiRouterService.routeMessage({
            messages,
            workspaceId: workspace.id,
            routerModel: workspace.routerModel,
          });

          if (!agent) {
            writer.write({
              type: 'data-routing-status' as const,
              id: 'routing-status',
              data: {
                text: '',
                state: 'error',
              },
            });
            throw new AgentException(
              'No agents available for routing',
              AgentExceptionCode.AGENT_EXECUTION_FAILED,
            );
          }

          this.logger.log(`Using agent ${agent.id} for message routing`);

          const routedStatusPart = {
            type: 'data-routing-status' as const,
            id: 'routing-status',
            data: {
              text: `Routed to ${agent.label} agent`,
              state: 'routed',
            },
          };

          writer.write(routedStatusPart);

          const result = await this.agentExecutionService.streamChatResponse({
            workspace,
            agentId: agent.id,
            userWorkspaceId,
            messages,
            recordIdsByObjectMetadataNameSingular,
          });

          writer.merge(
            result.toUIMessageStream({
              onError: (error) => {
                return error instanceof Error ? error.message : String(error);
              },
              sendStart: false,
              onFinish: async ({ responseMessage }) => {
                if (responseMessage.parts.length === 0) {
                  return;
                }

                await this.agentChatService.addMessage({
                  threadId,
                  uiMessage: {
                    role: AgentChatMessageRole.USER,
                    parts: [
                      {
                        type: 'text',
                        text:
                          messages[messages.length - 1].parts.find(
                            (part) => part.type === 'text',
                          )?.text ?? '',
                      },
                    ],
                  },
                });

                await this.agentChatService.addMessage({
                  threadId,
                  uiMessage: {
                    ...responseMessage,
                    parts: [routedStatusPart, ...responseMessage.parts],
                  },
                });
              },
              sendReasoning: true,
            }),
          );
        },
      });

      pipeUIMessageStreamToResponse({ stream, response });
    } catch (error) {
      this.logger.error(error.message);
      response.end();
    }
  }
}
