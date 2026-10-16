import { Injectable } from '@nestjs/common';

import { isNonEmptyString } from '@sniptt/guards';
import { type AgentChatSubscriptionEvent } from 'twenty-shared/ai';
import { type AgentRunEvent } from 'twenty-shared/application';
import { isDefined } from 'twenty-shared/utils';

import { type FlatApplication } from 'src/engine/core-modules/application/types/flat-application.type';
import { type AgentRunEventPayloadDTO } from 'src/engine/metadata-modules/ai/ai-agent-execution/dtos/agent-run-event-payload.dto';
import { AgentRunService } from 'src/engine/metadata-modules/ai/ai-agent-execution/services/agent-run.service';
import { AgentRunStatusService } from 'src/engine/metadata-modules/ai/ai-agent-execution/services/agent-run-status.service';
import { buildAgentRunThreadId } from 'src/engine/metadata-modules/ai/ai-agent-execution/utils/build-agent-run-thread-id.util';
import { createAgentRunEventStreamState } from 'src/engine/metadata-modules/ai/ai-agent-execution/utils/create-agent-run-event-stream-state.util';
import { mapAgentChatEventToAgentRunEvents } from 'src/engine/metadata-modules/ai/ai-agent-execution/utils/map-agent-chat-event-to-agent-run-events.util';
import { replayAgentChatChunks } from 'src/engine/metadata-modules/ai/ai-agent-execution/utils/replay-agent-chat-chunks.util';
import { mapAgentMessagesToAgentRunEvents } from 'src/engine/metadata-modules/ai/ai-agent-execution/utils/map-agent-messages-to-agent-run-events.util';
import { AgentChatEventPublisherService } from 'src/engine/metadata-modules/ai/ai-chat/services/agent-chat-event-publisher.service';
import { buildStreamAssistantMessageId } from 'src/engine/metadata-modules/ai/ai-chat/utils/build-stream-assistant-message-id.util';
import { AgentHistoryRepository } from 'src/engine/metadata-modules/ai/ai-history/repositories/agent-history-repository';
import { InjectAgentHistoryRepository } from 'src/engine/metadata-modules/ai/ai-history/repositories/inject-agent-history-repository.decorator';
import { AgentConversationReaderService } from 'src/engine/metadata-modules/ai/ai-history/services/agent-conversation-reader.service';
import { AgentTurnRecorderService } from 'src/engine/metadata-modules/ai/ai-history/services/agent-turn-recorder.service';
import { type AgentMessageWorkspaceEntity } from 'src/engine/metadata-modules/ai/ai-history/standard-objects/agent-message.workspace-entity';
import { type AgentConversationActor } from 'src/engine/metadata-modules/ai/ai-history/types/agent-conversation-actor.type';
import { findTurnIdsActedByOthers } from 'src/engine/metadata-modules/ai/ai-history/utils/find-turn-ids-acted-by-others.util';
import { flatMapAsyncIterator } from 'src/engine/subscriptions/utils/flat-map-async-iterator';
import { SubscriptionService } from 'src/engine/subscriptions/subscription.service';

type AgentChatEventPayload = {
  onAgentChatEvent: { threadId: string; event: AgentChatSubscriptionEvent };
};

export type AgentRunEventSubscriptionPayload = {
  onAgentRunEvent: AgentRunEventPayloadDTO;
};

const TOOL_EVENT_TYPES: AgentRunEvent['type'][] = [
  'agent.tool_use',
  'agent.tool_result',
];

@Injectable()
export class AgentRunEventService {
  constructor(
    private readonly agentRunService: AgentRunService,
    private readonly agentRunStatusService: AgentRunStatusService,
    private readonly conversationReaderService: AgentConversationReaderService,
    private readonly turnRecorderService: AgentTurnRecorderService,
    private readonly eventPublisherService: AgentChatEventPublisherService,
    private readonly subscriptionService: SubscriptionService,
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
    const thread = await this.agentRunStatusService.findThreadStatus({
      workspaceId,
      threadId,
    });

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
      await this.agentRunStatusService.buildCurrentStatusEvent({
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
              ? await this.agentRunStatusService.resolveIdleStopReason({
                  workspaceId,
                  threadId,
                })
              : undefined,
        });

        state = mapped.state;

        return toPayloads(mapped.events);
      },
    });
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
