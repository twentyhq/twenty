import { type AgentChatSubscriptionEvent } from 'twenty-shared/ai';

import { AiRunEventService } from 'src/engine/metadata-modules/ai/ai-agent-execution/services/ai-run-event.service';
import { type AiRunMessage } from 'src/engine/metadata-modules/ai/ai-agent-execution/utils/build-ai-run-events.util';
import { AgentMessageRole } from 'src/engine/metadata-modules/ai/ai-history/enums/agent-message-role.enum';
import { AgentMessageStatus } from 'src/engine/metadata-modules/ai/ai-history/enums/agent-message-status.enum';
import { AgentTurnStatus } from 'src/engine/metadata-modules/ai/ai-history/enums/agent-turn-status.enum';
import { type AgentMessagePartWorkspaceEntity } from 'src/engine/metadata-modules/ai/ai-history/standard-objects/agent-message-part.workspace-entity';

const AT = '2026-10-31T10:00:00.000Z';
const ACTOR = { type: 'application' as const, applicationId: 'application-id' };
const SCOPE = { runId: 'turn-id', threadId: 'thread-id' };

const buildTextMessage = ({
  id,
  role,
  text,
}: {
  id: string;
  role: AgentMessageRole;
  text: string;
}): AiRunMessage => ({
  id,
  turnId: 'turn-id',
  role,
  status: AgentMessageStatus.SENT,
  createdAt: AT,
  senderWorkspaceMemberId: null,
  senderApplicationId: 'application-id',
  parts: [
    { type: 'text', textContent: text, orderIndex: 0 },
  ] as AgentMessagePartWorkspaceEntity[],
});

const buildContext = () => {
  const record = {
    status: AgentTurnStatus.RUNNING,
    messages: [
      buildTextMessage({
        id: 'prompt-id',
        role: AgentMessageRole.USER,
        text: 'Enrich Acme',
      }),
    ],
  };
  const published: ((value: IteratorResult<unknown>) => void)[] = [];
  const queued: unknown[] = [];
  const chatEvents = {
    next: jest.fn(
      () =>
        new Promise<IteratorResult<unknown>>((resolve) => {
          const value = queued.shift();

          if (value !== undefined) {
            resolve({ done: false, value });
          } else {
            published.push(resolve);
          }
        }),
    ),
    return: jest.fn(async () => ({ done: true, value: undefined })),
  };
  const publish = (event: AgentChatSubscriptionEvent) => {
    const value = { onAgentChatEvent: { threadId: 'thread-id', event } };
    const resolve = published.shift();

    if (resolve !== undefined) {
      resolve({ done: false, value });
    } else {
      queued.push(value);
    }
  };
  const turnRepository = {
    find: jest.fn(async () => [
      {
        id: 'turn-id',
        status: record.status,
        error: null,
        createdAt: AT,
        updatedAt: AT,
        startedAt: AT,
        endedAt: null,
        inputTokens: null,
        outputTokens: null,
      },
    ]),
  };
  const service = new AiRunEventService(
    turnRepository as never,
    { find: jest.fn(async () => record.messages) } as never,
    {} as never,
    {
      getAccumulatedChunks: jest.fn(async () => ({ chunks: [], maxSeq: 0 })),
    } as never,
    { subscribeToAgentChat: jest.fn(async () => chatEvents) } as never,
  );

  return { service, record, chatEvents, publish, turnRepository };
};

const nextId = async (iterator: AsyncIterableIterator<{ id: string }>) =>
  (await iterator.next()).value?.id;

describe('AiRunEventService.streamEvents', () => {
  it('replays after the cursor, goes live without repeating an event, and ends with the run', async () => {
    const { service, record, chatEvents, publish } = buildContext();
    const iterator = await service.streamEvents({
      workspaceId: 'workspace-id',
      scope: SCOPE,
      actor: ACTOR,
      after: 'turn-id:started',
    });

    expect(await nextId(iterator)).toBe('prompt-id:text:0');

    // a member writes while the run goes on: the message is read from the record
    record.messages.push(
      buildTextMessage({
        id: 'member-message-id',
        role: AgentMessageRole.USER,
        text: 'Only the US one',
      }),
    );
    publish({ type: 'message-added', messageId: 'member-message-id' });
    expect(await nextId(iterator)).toBe('member-message-id:text:0');

    record.messages.push(
      buildTextMessage({
        id: 'reply-id',
        role: AgentMessageRole.ASSISTANT,
        text: 'Done',
      }),
    );
    record.status = AgentTurnStatus.COMPLETED;
    publish({ type: 'keepalive' });
    publish({ type: 'message-persisted', messageId: 'reply-id' });

    expect(await nextId(iterator)).toBe('reply-id:text:0');
    expect(await nextId(iterator)).toBe('turn-id:completed');
    expect(await iterator.next()).toEqual({ done: true, value: undefined });
    expect(chatEvents.return).toHaveBeenCalledTimes(1);
  });

  it('subscribes before it reads, so nothing published meanwhile is lost', async () => {
    const { service, chatEvents, turnRepository } = buildContext();

    await service.streamEvents({
      workspaceId: 'workspace-id',
      scope: SCOPE,
      actor: ACTOR,
    });

    expect(chatEvents.next.mock.invocationCallOrder[0]).toBeLessThan(
      turnRepository.find.mock.invocationCallOrder[0],
    );
  });
});
