import { Injectable } from '@nestjs/common';

import { isNonEmptyString } from '@sniptt/guards';
import { type AgentChatSubscriptionEvent } from 'twenty-shared/ai';
import { type AiRunEvent } from 'twenty-shared/application';
import { isDefined } from 'twenty-shared/utils';

import { type FlatApplication } from 'src/engine/core-modules/application/types/flat-application.type';
import { canCallerReachApplication } from 'src/engine/core-modules/application/utils/can-caller-reach-application.util';
import { type FlatWorkspace } from 'src/engine/core-modules/workspace/types/flat-workspace.type';
import { buildAgentRunThreadId } from 'src/engine/metadata-modules/ai/ai-agent-execution/utils/build-agent-run-thread-id.util';
import { buildAiRunEvents } from 'src/engine/metadata-modules/ai/ai-agent-execution/utils/build-ai-run-events.util';
import { createAiRunEventFeed } from 'src/engine/metadata-modules/ai/ai-agent-execution/utils/create-ai-run-event-feed.util';
import { readStreamedAgentMessage } from 'src/engine/metadata-modules/ai/ai-agent-execution/utils/read-streamed-agent-message.util';
import { AgentEntity } from 'src/engine/metadata-modules/ai/ai-agent/entities/agent.entity';
import { AgentChatEventPublisherService } from 'src/engine/metadata-modules/ai/ai-chat/services/agent-chat-event-publisher.service';
import { AgentTurnStatus } from 'src/engine/metadata-modules/ai/ai-history/enums/agent-turn-status.enum';
import { AgentHistoryRepository } from 'src/engine/metadata-modules/ai/ai-history/repositories/agent-history-repository';
import { InjectAgentHistoryRepository } from 'src/engine/metadata-modules/ai/ai-history/repositories/inject-agent-history-repository.decorator';
import { type AgentMessageWorkspaceEntity } from 'src/engine/metadata-modules/ai/ai-history/standard-objects/agent-message.workspace-entity';
import { type AgentTurnWorkspaceEntity } from 'src/engine/metadata-modules/ai/ai-history/standard-objects/agent-turn.workspace-entity';
import { type AgentConversationActor } from 'src/engine/metadata-modules/ai/ai-history/types/agent-conversation-actor.type';
import {
  AiException,
  AiExceptionCode,
} from 'src/engine/metadata-modules/ai/ai.exception';
import { SubscriptionService } from 'src/engine/subscriptions/subscription.service';
import { flatMapAsyncIterator } from 'src/engine/subscriptions/utils/flat-map-async-iterator';
import { InjectWorkspaceScopedRepository } from 'src/engine/twenty-orm/workspace-scoped-repository/inject-workspace-scoped-repository.decorator';
import { WorkspaceScopedRepository } from 'src/engine/twenty-orm/workspace-scoped-repository/workspace-scoped-repository';

export type AiRunEventsTarget = {
  runId?: string | null;
  agentUniversalIdentifier?: string | null;
  threadKey?: string | null;
};

// one run, or every run of a conversation; a run without a conversation has no thread
export type AiRunEventsScope =
  | { runId: string; threadId: string | null }
  | { runId: null; threadId: string };

// what can change what a run has on record, or the reply it streams
const RECORD_EVENT_TYPES = new Set<AgentChatSubscriptionEvent['type']>([
  'message-persisted',
  'message-added',
  'queue-updated',
  'tool-call-resolved',
  'stream-error',
  'credits-exhausted',
]);
const STEP_CHUNK_TYPES = new Set<unknown>([
  'start',
  'text-end',
  'tool-input-available',
  'tool-input-error',
  'tool-output-available',
  'tool-output-error',
]);

const isRunEnd = (event: AiRunEvent): boolean =>
  event.type === 'RUN_COMPLETED' || event.type === 'RUN_FAILED';

@Injectable()
export class AiRunEventService {
  constructor(
    @InjectAgentHistoryRepository('agentTurn')
    private readonly turnRepository: AgentHistoryRepository<AgentTurnWorkspaceEntity>,
    @InjectAgentHistoryRepository('agentMessage')
    private readonly messageRepository: AgentHistoryRepository<AgentMessageWorkspaceEntity>,
    @InjectWorkspaceScopedRepository(AgentEntity)
    private readonly agentRepository: WorkspaceScopedRepository<AgentEntity>,
    private readonly eventPublisherService: AgentChatEventPublisherService,
    private readonly subscriptionService: SubscriptionService,
  ) {}

  // An application reaches the runs of its agents and the runs it made itself. A conversation is
  // keyed by the caller, as runAgent keys it, so no other application reaches it
  async resolveScopeOrThrow({
    workspace,
    callerApplication,
    target: { runId, agentUniversalIdentifier, threadKey },
  }: {
    workspace: FlatWorkspace;
    callerApplication: FlatApplication;
    target: AiRunEventsTarget;
  }): Promise<AiRunEventsScope> {
    const isReachable = (applicationId: string | null | undefined) =>
      isDefined(applicationId) &&
      canCallerReachApplication({
        callingApplication: callerApplication,
        applicationId,
        operation: 'read',
        workspaceCustomApplicationId: workspace.workspaceCustomApplicationId,
      });

    if (isNonEmptyString(runId) && !isDefined(agentUniversalIdentifier)) {
      const turn = await this.turnRepository.findOne(workspace.id, {
        where: { id: runId },
      });
      const agent = isDefined(turn?.agentId)
        ? await this.agentRepository.findOne(workspace.id, {
            where: { id: turn.agentId },
          })
        : null;

      if (
        !isDefined(turn) ||
        !isReachable(
          isDefined(turn.agentId)
            ? agent?.applicationId
            : turn.createdBy.context?.applicationId,
        )
      ) {
        throw new AiException(
          `Run ${runId} not found`,
          AiExceptionCode.RECORD_NOT_FOUND,
        );
      }

      return { runId, threadId: turn.threadId };
    }

    if (
      isDefined(runId) ||
      !isNonEmptyString(agentUniversalIdentifier) ||
      !isNonEmptyString(threadKey)
    ) {
      throw new AiException(
        'Pass either runId, or agentUniversalIdentifier and threadKey',
        AiExceptionCode.INVALID_AGENT_INPUT,
      );
    }

    const agent = await this.agentRepository.findOne(workspace.id, {
      where: { universalIdentifier: agentUniversalIdentifier },
    });

    if (!isDefined(agent) || !isReachable(agent.applicationId)) {
      throw new AiException(
        `Agent ${agentUniversalIdentifier} not found`,
        AiExceptionCode.AGENT_NOT_FOUND,
      );
    }

    return {
      runId: null,
      threadId: buildAgentRunThreadId({
        applicationId: callerApplication.id,
        agentId: agent.id,
        threadKey,
      }),
    };
  }

  async listEvents({
    workspaceId,
    scope,
    actor,
    after,
  }: {
    workspaceId: string;
    scope: AiRunEventsScope;
    actor: AgentConversationActor;
    after?: string | null;
  }): Promise<AiRunEvent[]> {
    return createAiRunEventFeed({ after })(
      await this.readEvents({ workspaceId, scope, actor }),
    );
  }

  // Replays the events after the cursor, then reads the run again on every change of its
  // conversation. A run's stream ends with the run; a conversation's stays open
  async streamEvents({
    workspaceId,
    scope,
    actor,
    after,
  }: {
    workspaceId: string;
    scope: AiRunEventsScope;
    actor: AgentConversationActor;
    after?: string | null;
  }): Promise<AsyncIterableIterator<AiRunEvent>> {
    const { threadId } = scope;
    const feed = createAiRunEventFeed({ after });
    let isRunOver = false;
    let hasReadSinceSubscribing = false;

    const read = async () => {
      const events = await this.readEvents({ workspaceId, scope, actor });

      isRunOver = isDefined(scope.runId) && events.some(isRunEnd);

      return feed(events);
    };

    // a run without a conversation publishes nothing as it goes, so it is only replayed
    const chatEvents: AsyncIterator<{
      onAgentChatEvent: { event: AgentChatSubscriptionEvent };
    }> = isDefined(threadId)
      ? await this.subscriptionService.subscribeToAgentChat({
          workspaceId,
          threadId,
        })
      : { next: async () => ({ done: true, value: undefined }) };

    return flatMapAsyncIterator({
      iterator: chatEvents,
      readPrefix: read,
      mapValue: async ({ onAgentChatEvent: { event } }) => {
        const isChange =
          event.type === 'stream-chunk'
            ? STEP_CHUNK_TYPES.has(event.chunk.type)
            : RECORD_EVENT_TYPES.has(event.type);

        // the first value, a keepalive at worst, catches up on what landed while subscribing
        if (!isChange && hasReadSinceSubscribing) {
          return [];
        }

        hasReadSinceSubscribing = true;

        return read();
      },
      isDone: () => isRunOver,
    });
  }

  private async readEvents({
    workspaceId,
    scope,
    actor,
  }: {
    workspaceId: string;
    scope: AiRunEventsScope;
    actor: AgentConversationActor;
  }): Promise<AiRunEvent[]> {
    const { runId, threadId } = scope;
    const turns = await this.turnRepository.find(workspaceId, {
      where: isDefined(scope.runId)
        ? { id: scope.runId }
        : { threadId: scope.threadId },
      order: { createdAt: 'ASC', id: 'ASC' },
    });

    if (!isDefined(threadId)) {
      return buildAiRunEvents({
        turns,
        messages: [],
        streamedMessage: null,
        actor,
      });
    }

    const isStreaming = turns.some(
      ({ status }) => status === AgentTurnStatus.RUNNING,
    );
    const [messages, streamedMessage] = await Promise.all([
      this.messageRepository.find(workspaceId, {
        where: isDefined(runId) ? { turnId: runId } : { threadId },
        order: {
          processedAt: { order: 'ASC', nulls: 'NULLS LAST' },
          createdAt: 'ASC',
        },
        relations: ['parts'],
      }),
      isStreaming
        ? this.eventPublisherService
            .getAccumulatedChunks(threadId)
            .then(({ chunks }) => readStreamedAgentMessage(chunks))
        : null,
    ]);

    return buildAiRunEvents({ turns, messages, streamedMessage, actor });
  }
}
