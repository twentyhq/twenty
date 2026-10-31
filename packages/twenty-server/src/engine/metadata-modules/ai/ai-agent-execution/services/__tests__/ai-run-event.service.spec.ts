import {
  type AgentChatSubscriptionEvent,
  type ExtendedUIMessagePart,
} from 'twenty-shared/ai';

import { ApplicationRegistrationSourceType } from 'src/engine/core-modules/application/application-registration/enums/application-registration-source-type.enum';

import { AiRunEventService } from 'src/engine/metadata-modules/ai/ai-agent-execution/services/ai-run-event.service';
import { type AiRunMessage } from 'src/engine/metadata-modules/ai/ai-agent-execution/utils/build-ai-run-events.util';
import { AgentMessageRole } from 'src/engine/metadata-modules/ai/ai-history/enums/agent-message-role.enum';
import { AgentMessageStatus } from 'src/engine/metadata-modules/ai/ai-history/enums/agent-message-status.enum';
import { AgentTurnStatus } from 'src/engine/metadata-modules/ai/ai-history/enums/agent-turn-status.enum';
import { type AgentMessagePartWorkspaceEntity } from 'src/engine/metadata-modules/ai/ai-history/standard-objects/agent-message-part.workspace-entity';
import { mapUIMessagePartsToDBParts } from 'src/engine/metadata-modules/ai/ai-history/utils/map-ui-message-parts-to-db-parts.util';
import { AiExceptionCode } from 'src/engine/metadata-modules/ai/ai.exception';

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

const buildReplyMessage = (parts: ExtendedUIMessagePart[]): AiRunMessage => ({
  id: 'reply-id',
  turnId: 'turn-id',
  role: AgentMessageRole.ASSISTANT,
  status: AgentMessageStatus.SENT,
  createdAt: AT,
  senderWorkspaceMemberId: null,
  senderApplicationId: null,
  parts: mapUIMessagePartsToDBParts(
    parts,
    'reply-id',
  ) as AgentMessagePartWorkspaceEntity[],
});

const FIND_COMPANY_CALL = {
  type: 'tool-find_companies',
  toolCallId: 'call-id',
  input: { name: 'Acme' },
} as const;

type ChatEventValue = {
  onAgentChatEvent: { threadId: string; event: AgentChatSubscriptionEvent };
};

const buildContext = () => {
  const record: {
    status: AgentTurnStatus;
    messages: AiRunMessage[];
    turn: { agentId: string | null; threadId: string | null } | null;
    queuedRun: { agentId: string; threadId: string } | null;
    onReadStream: () => void;
  } = {
    turn: null,
    queuedRun: null,
    onReadStream: () => {},
    status: AgentTurnStatus.RUNNING,
    messages: [
      buildTextMessage({
        id: 'prompt-id',
        role: AgentMessageRole.USER,
        text: 'Enrich Acme',
      }),
    ],
  };
  const published: ((value: IteratorResult<ChatEventValue>) => void)[] = [];
  const queued: ChatEventValue[] = [];
  const chatEvents = {
    next: jest.fn(
      () =>
        new Promise<IteratorResult<ChatEventValue>>((resolve) => {
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
    const value: ChatEventValue = {
      onAgentChatEvent: { threadId: 'thread-id', event },
    };
    const resolve = published.shift();

    if (resolve !== undefined) {
      resolve({ done: false, value });
    } else {
      queued.push(value);
    }
  };
  const turnRepository = {
    findOne: jest.fn(async () => record.turn),
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
    {
      findOne: jest.fn(async () => ({ applicationId: 'application-id' })),
    } as never,
    {
      getAccumulatedChunks: jest.fn(async () => {
        record.onReadStream();

        return { chunks: [], maxSeq: 0 };
      }),
    } as never,
    { subscribeToAgentChat: jest.fn(async () => chatEvents) } as never,
    { find: jest.fn(async () => record.queuedRun) } as never,
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

  it('reads a run again on keepalives, so a run that ends without publishing still ends its stream', async () => {
    const { service, record, publish } = buildContext();
    const now = jest.spyOn(Date, 'now').mockReturnValue(0);
    const iterator = await service.streamEvents({
      workspaceId: 'workspace-id',
      scope: SCOPE,
      actor: ACTOR,
      after: 'prompt-id:text:0',
    });

    record.messages.push(
      buildTextMessage({
        id: 'member-message-id',
        role: AgentMessageRole.USER,
        text: 'Stop',
      }),
    );
    publish({ type: 'message-added', messageId: 'member-message-id' });
    expect(await nextId(iterator)).toBe('member-message-id:text:0');

    record.status = AgentTurnStatus.CANCELLED;
    now.mockReturnValue(60_000);
    publish({ type: 'keepalive' });

    expect(await nextId(iterator)).toBe('turn-id:failed');
    expect(await iterator.next()).toEqual({ done: true, value: undefined });
    now.mockRestore();
  });
});

describe('AiRunEventService.listEvents', () => {
  it('never takes the checkpoint of a reply whose stream was cleared as it ended', async () => {
    const { service, record } = buildContext();

    record.messages.push(
      buildReplyMessage([{ ...FIND_COMPANY_CALL, state: 'input-available' }]),
    );
    record.onReadStream = () => {
      record.status = AgentTurnStatus.COMPLETED;
      record.messages = [
        record.messages[0],
        buildReplyMessage([
          {
            ...FIND_COMPANY_CALL,
            state: 'output-available',
            output: { companies: [] },
          },
        ]),
      ];
    };

    const events = await service.listEvents({
      workspaceId: 'workspace-id',
      scope: SCOPE,
      actor: ACTOR,
    });

    expect(events.find(({ type }) => type === 'TOOL_RESULT')).toMatchObject({
      id: 'call-id:result',
      isError: false,
      output: { companies: [] },
    });
    expect(events[events.length - 1].type).toBe('RUN_COMPLETED');
  });
});

describe('AiRunEventService.resolveScopeOrThrow', () => {
  const WORKSPACE = {
    id: 'workspace-id',
    workspaceCustomApplicationId: 'workspace-custom-application-id',
  };
  const CALLER_APPLICATION = {
    id: 'application-id',
    universalIdentifier: 'application-universal-identifier',
    sourceType: ApplicationRegistrationSourceType.LOCAL,
  };

  it('follows a run that runAgent queued before the worker opens its turn', async () => {
    const { service, record } = buildContext();

    record.queuedRun = { agentId: 'agent-id', threadId: 'thread-id' };

    await expect(
      service.resolveScopeOrThrow({
        workspace: WORKSPACE,
        callerApplication: CALLER_APPLICATION,
        target: { runId: 'turn-id' },
      }),
    ).resolves.toEqual({ runId: 'turn-id', threadId: 'thread-id' });
  });

  it('refuses a run that is neither queued nor on record', async () => {
    const { service } = buildContext();

    await expect(
      service.resolveScopeOrThrow({
        workspace: WORKSPACE,
        callerApplication: CALLER_APPLICATION,
        target: { runId: 'turn-id' },
      }),
    ).rejects.toMatchObject({ code: AiExceptionCode.RECORD_NOT_FOUND });
  });
});
