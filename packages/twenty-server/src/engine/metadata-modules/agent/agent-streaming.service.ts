import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import {
  createUIMessageStream,
  pipeUIMessageStreamToResponse,
  type UIDataTypes,
  type UIMessage,
  type UITools,
} from 'ai';
import { type Response } from 'express';
import { type ExtendedUIMessage } from 'twenty-shared/ai';
import { type Repository } from 'typeorm';

import { type ModelId } from 'src/engine/core-modules/ai/constants/ai-models.const';
import { AIBillingService } from 'src/engine/core-modules/ai/services/ai-billing.service';
import { convertCentsToBillingCredits } from 'src/engine/core-modules/ai/utils/convert-cents-to-billing-credits.util';
import { type WorkspaceEntity } from 'src/engine/core-modules/workspace/workspace.entity';
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

export type TokenUsage = {
  promptTokens: number;
  completionTokens: number;
  totalTokens: number;
};

export type StreamAgentChatOptions = {
  threadId: string;
  userWorkspaceId: string;
  workspace: WorkspaceEntity;
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
    private readonly aiBillingService: AIBillingService,
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
          const startTime = Date.now();

          writer.write({
            type: 'data-routing-status' as const,
            id: 'routing-status',
            data: {
              text: 'Finding the best agent for your request...',
              state: 'loading',
            },
          });

          const routingStart = Date.now();
          const includeDebugInfo = true;
          const routeResult = await this.aiRouterService.routeMessage(
            {
              messages,
              workspaceId: workspace.id,
              routerModel: workspace.routerModel,
            },
            includeDebugInfo,
          );

          const routingTime = Date.now() - routingStart;
          const { agent, debugInfo, toolHints } = routeResult;

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

          let routingCostInCredits: number | undefined;

          if (
            debugInfo?.routerModel &&
            debugInfo?.promptTokens !== undefined &&
            debugInfo?.completionTokens !== undefined
          ) {
            try {
              const routingCostInCents =
                await this.aiBillingService.calculateCost(
                  debugInfo.routerModel as ModelId,
                  {
                    inputTokens: debugInfo.promptTokens,
                    outputTokens: debugInfo.completionTokens,
                    totalTokens: debugInfo.totalTokens || 0,
                  },
                );

              routingCostInCredits = Math.round(
                convertCentsToBillingCredits(routingCostInCents),
              );
            } catch (error) {
              this.logger.warn('Failed to calculate routing cost:', error);
            }
          }

          const agentExecutionStart = Date.now();

          const {
            stream: result,
            timings,
            contextInfo,
          } = await this.agentExecutionService.streamChatResponse({
            workspace,
            agentId: agent.id,
            userWorkspaceId,
            messages,
            recordIdsByObjectMetadataNameSingular,
            toolHints,
          });

          const routedStatusPart = {
            type: 'data-routing-status' as const,
            id: 'routing-status',
            data: {
              text: `Routed to ${agent.label} agent`,
              state: 'routed',
              debug: {
                routingTimeMs: routingTime,
                contextBuildTimeMs: timings.contextBuildTimeMs,
                agentExecutionStartTimeMs: Date.now() - startTime,
                selectedAgentId: agent.id,
                selectedAgentLabel: agent.label,
                availableAgents: debugInfo?.availableAgents,
                routerModel: debugInfo?.routerModel,
                agentModel: agent.modelId,
                context: contextInfo.contextString || undefined,
                contextRecordCount: contextInfo.contextRecordCount,
                contextSizeBytes: contextInfo.contextSizeBytes,
                routingPromptTokens: debugInfo?.promptTokens,
                routingCompletionTokens: debugInfo?.completionTokens,
                routingTotalTokens: debugInfo?.totalTokens,
                routingCostInCredits,
              },
            },
          };

          writer.write(routedStatusPart);

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

                const toolCallCount = responseMessage.parts.filter((part) =>
                  part.type.startsWith('tool-'),
                ).length;

                const tokenUsage = await this.extractTokenUsage(result.usage);

                const agentExecutionTime = Date.now() - agentExecutionStart;

                let agentCostInCredits: number | undefined;
                let totalCostInCredits: number | undefined;

                if (
                  agent.modelId &&
                  tokenUsage &&
                  tokenUsage.promptTokens > 0 &&
                  tokenUsage.completionTokens > 0
                ) {
                  try {
                    const agentCostInCents =
                      await this.aiBillingService.calculateCost(
                        agent.modelId as ModelId,
                        {
                          inputTokens: tokenUsage.promptTokens,
                          outputTokens: tokenUsage.completionTokens,
                          totalTokens: tokenUsage.totalTokens,
                        },
                      );

                    agentCostInCredits = Math.round(
                      convertCentsToBillingCredits(agentCostInCents),
                    );

                    totalCostInCredits =
                      (routingCostInCredits || 0) + agentCostInCredits;
                  } catch (error) {
                    this.logger.warn('Failed to calculate agent cost:', error);
                  }
                }

                const updatedRoutedStatusPart = {
                  ...routedStatusPart,
                  data: {
                    ...routedStatusPart.data,
                    debug: {
                      ...routedStatusPart.data.debug,
                      agentExecutionTimeMs: agentExecutionTime,
                      toolCallCount,
                      toolCount: timings.toolCount,
                      agentContextBuildTimeMs: timings.contextBuildTimeMs,
                      toolGenerationTimeMs: timings.toolGenerationTimeMs,
                      aiRequestPrepTimeMs: timings.aiRequestPrepTimeMs,
                      ...(tokenUsage && {
                        agentPromptTokens: tokenUsage.promptTokens,
                        agentCompletionTokens: tokenUsage.completionTokens,
                        agentTotalTokens: tokenUsage.totalTokens,
                      }),
                      agentCostInCredits,
                      totalCostInCredits,
                    },
                  },
                };

                writer.write(updatedRoutedStatusPart);

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
                    parts: [updatedRoutedStatusPart, ...responseMessage.parts],
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
      this.logger.error(
        'Failed to stream agent chat:',
        error instanceof Error ? error.message : String(error),
      );
      response.end();
    }
  }

  private async extractTokenUsage(
    usagePromise: Promise<unknown>,
  ): Promise<TokenUsage | null> {
    try {
      const usage = await usagePromise;

      const usageWithTokens = usage as {
        inputTokens?: number;
        outputTokens?: number;
        promptTokens?: number;
        completionTokens?: number;
        totalTokens?: number;
      };

      const tokenUsage = {
        promptTokens:
          usageWithTokens.inputTokens ?? usageWithTokens.promptTokens ?? 0,
        completionTokens:
          usageWithTokens.outputTokens ?? usageWithTokens.completionTokens ?? 0,
        totalTokens: usageWithTokens.totalTokens ?? 0,
      };

      this.logger.log(
        `Agent execution usage: ${tokenUsage.promptTokens} prompt + ${tokenUsage.completionTokens} completion = ${tokenUsage.totalTokens} total tokens`,
      );

      return tokenUsage;
    } catch (error) {
      this.logger.warn('Failed to get token usage:', error);

      return null;
    }
  }
}
