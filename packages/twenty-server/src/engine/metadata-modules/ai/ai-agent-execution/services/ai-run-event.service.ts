import { Injectable } from '@nestjs/common';

import { isNonEmptyString, isString } from '@sniptt/guards';
import { type AgentChatSubscriptionEvent } from 'twenty-shared/ai';
import { type AiRunEvent } from 'twenty-shared/application';
import { isDefined } from 'twenty-shared/utils';

import { type FlatApplication } from 'src/engine/core-modules/application/types/flat-application.type';
import { canCallerReachApplication } from 'src/engine/core-modules/application/utils/can-caller-reach-application.util';
import { type FlatWorkspace } from 'src/engine/core-modules/workspace/types/flat-workspace.type';
import { QueuedAgentRunService } from 'src/engine/metadata-modules/ai/ai-agent-execution/services/queued-agent-run.service';
import { buildAgentRunThreadId } from 'src/engine/metadata-modules/ai/ai-agent-execution/utils/build-agent-run-thread-id.util';
import { buildAiRunEvents } from 'src/engine/metadata-modules/ai/ai-agent-execution/utils/build-ai-run-events.util';
import { createAiRunEventFeed } from 'src/engine/metadata-modules/ai/ai-agent-execution/utils/create-ai-run-event-feed.util';
import { readStreamedAgentMessage } from 'src/engine/metadata-modules/ai/ai-agent-execution/utils/read-streamed-agent-message.util';
import { AgentEntity } from 'src/engine/metadata-modules/ai/ai-agent/entities/agent.entity';
import { AGENT_CHAT_KEEPALIVE_INTERVAL_MS } from 'src/engine/metadata-modules/ai/ai-chat/constants/agent-chat-keepalive-interval-ms.constant';
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

const RECORD_EVENT_TYPES = new Set<AgentChatSubscriptionEvent['type']>([
  'message-persisted',
  'message-added',
  'queue-updated',
  'tool-call-resolved',
  'stream-error',
  'credits-exhausted',
]);
const STEP_CHUNK_TYPES = new Set<string>([
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
    private readonly queuedAgentRunService: QueuedAgentRunService,
  ) {}

  // a caller reaches the runs of agents it can reach, the runs it made, and only its own conversations
  async resolveScopeOrThrow({
    workspace,
    callerApplication,
    target: { runId, agentUniversalIdentifier, threadKey },
  }: {
    workspace: Pick<FlatWorkspace, 'id' | 'workspaceCustomApplicationId'>;
    callerApplication: Pick<
      FlatApplication,
      'id' | 'universalIdentifier' | 'sourceType'
    >;
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
      const queuedRun = isDefined(turn)
        ? null
        : await this.queuedAgentRunService.find({
            workspaceId: workspace.id,
            runId,
          });
      const agentId = turn?.agentId ?? queuedRun?.agentId;
      const agent = isDefined(agentId)
        ? await this.agentRepository.findOne(workspace.id, {
            where: { id: agentId },
          })
        : null;
      const threadId = isDefined(turn)
        ? turn.threadId
        : (queuedRun?.threadId ?? null);

      if (
        (!isDefined(turn) && !isDefined(queuedRun)) ||
        !isReachable(
          isDefined(agentId)
            ? agent?.applicationId
            : turn?.createdBy.context?.applicationId,
        )
      ) {
        throw new AiException(
          `Run ${runId} not found`,
          AiExceptionCode.RECORD_NOT_FOUND,
        );
      }

      return { runId, threadId };
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
      await this.readEventSteps({ workspaceId, scope, actor }),
    );
  }

  // a run's stream ends with the run; a conversation's stays open
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
    let lastReadAt = 0;

    const read = async () => {
      lastReadAt = Date.now();
      const steps = await this.readEventSteps({ workspaceId, scope, actor });

      isRunOver = isDefined(scope.runId) && steps.flat().some(isRunEnd);

      return feed(steps);
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
            ? isString(event.chunk.type) &&
              STEP_CHUNK_TYPES.has(event.chunk.type)
            : RECORD_EVENT_TYPES.has(event.type);
        // some ends of a run publish nothing, such as a closed question, so its stream checks on keepalives
        const isRunCheck =
          isDefined(scope.runId) &&
          event.type === 'keepalive' &&
          Date.now() - lastReadAt >= AGENT_CHAT_KEEPALIVE_INTERVAL_MS;

        // the first value, a keepalive at worst, catches up on what landed while subscribing
        if (!isChange && !isRunCheck && hasReadSinceSubscribing) {
          return [];
        }

        hasReadSinceSubscribing = true;

        return read();
      },
      isDone: () => isRunOver,
    });
  }

  private async readEventSteps({
    workspaceId,
    scope,
    actor,
  }: {
    workspaceId: string;
    scope: AiRunEventsScope;
    actor: AgentConversationActor;
  }): Promise<AiRunEvent[][]> {
    const { runId, threadId } = scope;
    const findTurns = () =>
      this.turnRepository.find(workspaceId, {
        where: isDefined(runId) ? { id: runId } : { threadId: scope.threadId },
        order: { createdAt: 'ASC', id: 'ASC' },
      });
    let turns = await findTurns();

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
    const streamedMessage = isStreaming
      ? await this.eventPublisherService
          .getAccumulatedChunks(threadId)
          .then(({ chunks }) => readStreamedAgentMessage(chunks))
      : null;

    // a reply is saved and its turn ended before its stream is cleared, so read after the stream they
    // are never a checkpoint whose running tools show as interrupted
    if (isStreaming && !isDefined(streamedMessage)) {
      turns = await findTurns();
    }

    const messages = await this.messageRepository.find(workspaceId, {
      where: isDefined(runId) ? { turnId: runId } : { threadId },
      order: {
        processedAt: { order: 'ASC', nulls: 'NULLS LAST' },
        createdAt: 'ASC',
      },
      relations: ['parts'],
    });

    return buildAiRunEvents({ turns, messages, streamedMessage, actor });
  }
}
