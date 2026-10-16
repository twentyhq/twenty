import { Injectable } from '@nestjs/common';

import { isNonEmptyString } from '@sniptt/guards';
import { type AgentChatSubscriptionEvent } from 'twenty-shared/ai';
import {
  type AgentRunEvent,
  type AgentRunStopReason,
} from 'twenty-shared/application';
import { isDefined } from 'twenty-shared/utils';

import { type FlatApplication } from 'src/engine/core-modules/application/types/flat-application.type';
import { type AgentRunEventPayloadDTO } from 'src/engine/metadata-modules/ai/ai-agent-execution/dtos/agent-run-event-payload.dto';
import { AgentRunService } from 'src/engine/metadata-modules/ai/ai-agent-execution/services/agent-run.service';
import { AgentRunSuspensionService } from 'src/engine/metadata-modules/ai/ai-agent-execution/services/agent-run-suspension.service';
import { buildAgentRunStatusEvent } from 'src/engine/metadata-modules/ai/ai-agent-execution/utils/build-agent-run-events.util';
import { buildAgentRunThreadId } from 'src/engine/metadata-modules/ai/ai-agent-execution/utils/build-agent-run-thread-id.util';
import {
  createAgentRunEventStreamState,
  mapAgentChatEventToAgentRunEvents,
  replayAgentChatChunks,
} from 'src/engine/metadata-modules/ai/ai-agent-execution/utils/map-agent-chat-event-to-agent-run-events.util';
import { mapAgentMessagesToAgentRunEvents } from 'src/engine/metadata-modules/ai/ai-agent-execution/utils/map-agent-messages-to-agent-run-events.util';
import { AgentChatEventPublisherService } from 'src/engine/metadata-modules/ai/ai-chat/services/agent-chat-event-publisher.service';
import { buildStreamAssistantMessageId } from 'src/engine/metadata-modules/ai/ai-chat/utils/build-stream-assistant-message-id.util';
import { AgentTurnStatus } from 'src/engine/metadata-modules/ai/ai-history/enums/agent-turn-status.enum';
import { AgentHistoryRepository } from 'src/engine/metadata-modules/ai/ai-history/repositories/agent-history-repository';
import { InjectAgentHistoryRepository } from 'src/engine/metadata-modules/ai/ai-history/repositories/inject-agent-history-repository.decorator';
import { AgentConversationReaderService } from 'src/engine/metadata-modules/ai/ai-history/services/agent-conversation-reader.service';
import { AgentTurnRecorderService } from 'src/engine/metadata-modules/ai/ai-history/services/agent-turn-recorder.service';
import { type AgentChatThreadWorkspaceEntity } from 'src/engine/metadata-modules/ai/ai-history/standard-objects/agent-chat-thread.workspace-entity';
import { type AgentMessageWorkspaceEntity } from 'src/engine/metadata-modules/ai/ai-history/standard-objects/agent-message.workspace-entity';
import { type AgentTurnWorkspaceEntity } from 'src/engine/metadata-modules/ai/ai-history/standard-objects/agent-turn.workspace-entity';
import { type AgentConversationActor } from 'src/engine/metadata-modules/ai/ai-history/types/agent-conversation-actor.type';
import { findTurnIdsActedByOthers } from 'src/engine/metadata-modules/ai/ai-history/utils/find-turn-ids-acted-by-others.util';
import { AiExceptionCode } from 'src/engine/metadata-modules/ai/ai.exception';
import { flatMapAsyncIterator } from 'src/engine/subscriptions/utils/flat-map-async-iterator';
import { SubscriptionService } from 'src/engine/subscriptions/subscription.service';

type AgentChatEventPayload = {
  onAgentChatEvent: { threadId: string; event: AgentChatSubscriptionEvent };
};

export type AgentRunEventSubscriptionPayload = {
  onAgentRunEvent: AgentRunEventPayloadDTO;
};

type AgentRunThreadStatus = Pick<
  AgentChatThreadWorkspaceEntity,
  'id' | 'activeStreamId' | 'pendingQuestionMessageId'
>;

type LatestAgentTurn = Pick<
  AgentTurnWorkspaceEntity,
  'id' | 'status' | 'error'
>;

const TOOL_EVENT_TYPES: AgentRunEvent['type'][] = [
  'agent.tool_use',
  'agent.tool_result',
];

// What an application sees of its agents' runs, as the history and live stream of a conversation
@Injectable()
export class AgentRunEventService {
  constructor(
    private readonly agentRunService: AgentRunService,
    private readonly agentRunSuspensionService: AgentRunSuspensionService,
    private readonly conversationReaderService: AgentConversationReaderService,
    private readonly turnRecorderService: AgentTurnRecorderService,
    private readonly eventPublisherService: AgentChatEventPublisherService,
    private readonly subscriptionService: SubscriptionService,
    @InjectAgentHistoryRepository('agentChatThread')
    private readonly threadRepository: AgentHistoryRepository<AgentChatThreadWorkspaceEntity>,
    @InjectAgentHistoryRepository('agentMessage')
    private readonly messageRepository: AgentHistoryRepository<AgentMessageWorkspaceEntity>,
  ) {}

  // the thread id derives from the application, so an application only reaches its own conversations
  async findThreadIdOrThrow({
    workspaceId,
    callerApplication,
    agentUniversalIdentifier,
    threadKey,
  }: {
    workspaceId: string;
    callerApplication: FlatApplication;
    agentUniversalIdentifier: string;
    threadKey: string;
  }): Promise<string> {
    const agent = await this.agentRunService.findCallerAgentOrThrow({
      workspaceId,
      agentUniversalIdentifier,
      callerApplication,
    });

    return buildAgentRunThreadId({
      applicationId: callerApplication.id,
      agentId: agent.id,
      threadKey,
    });
  }

  async listEvents({
    workspaceId,
    threadId,
    actor,
  }: {
    workspaceId: string;
    threadId: string;
    actor: AgentConversationActor;
  }): Promise<AgentRunEvent[]> {
    const thread = await this.findThreadStatus({ workspaceId, threadId });

    if (!isDefined(thread)) {
      return [];
    }

    // the streaming reply is checkpointed partway, so it is left to the live stream to replay
    const streamingMessageId = isNonEmptyString(thread.activeStreamId)
      ? buildStreamAssistantMessageId(thread.activeStreamId)
      : null;
    const messages = (
      await this.conversationReaderService.loadMessages({
        workspaceId,
        threadId,
        actor,
      })
    ).filter(({ id }) => id !== streamingMessageId);

    return [
      ...mapAgentMessagesToAgentRunEvents(messages),
      await this.buildStatusEvent({
        workspaceId,
        thread,
        streamingMessageId,
        lastMessageId: messages[messages.length - 1]?.id ?? null,
      }),
    ];
  }

  async subscribeToEvents({
    workspaceId,
    threadId,
    actor,
  }: {
    workspaceId: string;
    threadId: string;
    actor: AgentConversationActor;
  }): Promise<AsyncIterableIterator<AgentRunEventSubscriptionPayload>> {
    const chatEvents = (await this.subscriptionService.subscribeToAgentChat({
      workspaceId,
      threadId,
    })) as AsyncIterator<AgentChatEventPayload>;

    let state = createAgentRunEventStreamState(threadId);
    let isToolUseHidden = false;

    const toPayloads = async (
      events: AgentRunEvent[],
    ): Promise<AgentRunEventSubscriptionPayload[]> => {
      const payloads: AgentRunEventSubscriptionPayload[] = [];

      for (const event of events) {
        if (event.type === 'session.status_running') {
          isToolUseHidden = await this.isLatestTurnActedByOthers({
            workspaceId,
            threadId,
            actor,
          });
        }

        if (isToolUseHidden && TOOL_EVENT_TYPES.includes(event.type)) {
          continue;
        }

        payloads.push({ onAgentRunEvent: { threadId, event } });
      }

      return payloads;
    };

    return flatMapAsyncIterator({
      iterator: chatEvents,
      readPrefix: async () => {
        const { chunks, maxSeq } =
          await this.eventPublisherService.getAccumulatedChunks(threadId);
        const replayed = replayAgentChatChunks({ state, chunks, maxSeq });

        state = replayed.state;

        return toPayloads(replayed.events);
      },
      mapValue: async ({ onAgentChatEvent: { event } }) => {
        if (event.type === 'keepalive') {
          return [{ onAgentRunEvent: { threadId, event: null } }];
        }

        const mapped = mapAgentChatEventToAgentRunEvents({
          state,
          event,
          idleStopReason:
            event.type === 'message-persisted'
              ? await this.resolveIdleStopReason({ workspaceId, threadId })
              : undefined,
        });

        state = mapped.state;

        return toPayloads(mapped.events);
      },
    });
  }

  private async buildStatusEvent({
    workspaceId,
    thread,
    streamingMessageId,
    lastMessageId,
  }: {
    workspaceId: string;
    thread: AgentRunThreadStatus;
    streamingMessageId: string | null;
    lastMessageId: string | null;
  }): Promise<AgentRunEvent> {
    if (isDefined(streamingMessageId)) {
      return buildAgentRunStatusEvent({
        sourceId: streamingMessageId,
        status: { type: 'session.status_running' },
      });
    }

    const latestTurn = await this.turnRecorderService.findLatestTurn({
      workspaceId,
      threadId: thread.id,
    });

    if (latestTurn?.status === AgentTurnStatus.FAILED) {
      return buildAgentRunStatusEvent({
        sourceId: latestTurn.id,
        status: {
          type: 'session.error',
          error: latestTurn.error ?? {
            code: AiExceptionCode.AGENT_EXECUTION_FAILED,
            message: 'The agent run failed',
          },
        },
      });
    }

    return buildAgentRunStatusEvent({
      sourceId: lastMessageId ?? thread.id,
      status: {
        type: 'session.status_idle',
        stopReason: await this.findStopReason({
          workspaceId,
          thread,
          latestTurn,
        }),
      },
    });
  }

  private async resolveIdleStopReason({
    workspaceId,
    threadId,
  }: {
    workspaceId: string;
    threadId: string;
  }): Promise<AgentRunStopReason> {
    const [thread, latestTurn] = await Promise.all([
      this.findThreadStatus({ workspaceId, threadId }),
      this.turnRecorderService.findLatestTurn({ workspaceId, threadId }),
    ]);

    return isDefined(thread)
      ? this.findStopReason({ workspaceId, thread, latestTurn })
      : 'end_turn';
  }

  private findThreadStatus({
    workspaceId,
    threadId,
  }: {
    workspaceId: string;
    threadId: string;
  }): Promise<AgentRunThreadStatus | null> {
    return this.threadRepository.findOne(workspaceId, {
      where: { id: threadId },
      select: ['id', 'activeStreamId', 'pendingQuestionMessageId'],
    });
  }

  // a turn ending on a wait is recorded as waiting before the run arms its wake-up
  private async findStopReason({
    workspaceId,
    thread,
    latestTurn,
  }: {
    workspaceId: string;
    thread: AgentRunThreadStatus;
    latestTurn: LatestAgentTurn | null;
  }): Promise<AgentRunStopReason> {
    const isWaiting =
      isDefined(thread.pendingQuestionMessageId) ||
      latestTurn?.status === AgentTurnStatus.WAITING_FOR_INPUT ||
      (await this.agentRunSuspensionService.isConversationWaiting({
        workspaceId,
        threadId: thread.id,
      }));

    return isWaiting ? 'requires_action' : 'end_turn';
  }

  // history keeps a turn's tool calls only for whoever sent it, and so does the live stream
  private async isLatestTurnActedByOthers({
    workspaceId,
    threadId,
    actor,
  }: {
    workspaceId: string;
    threadId: string;
    actor: AgentConversationActor;
  }): Promise<boolean> {
    const latestTurn = await this.turnRecorderService.findLatestTurn({
      workspaceId,
      threadId,
    });

    if (!isDefined(latestTurn)) {
      return false;
    }

    const messages = await this.messageRepository.find(workspaceId, {
      where: { threadId, turnId: latestTurn.id },
      select: [
        'turnId',
        'role',
        'senderWorkspaceMemberId',
        'senderApplicationId',
      ],
    });

    return findTurnIdsActedByOthers({ messages, actor }).has(latestTurn.id);
  }
}
