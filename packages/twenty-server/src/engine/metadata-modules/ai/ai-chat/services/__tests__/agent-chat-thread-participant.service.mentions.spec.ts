import { QueryFailedError } from 'typeorm';
import { isDefined } from 'twenty-shared/utils';

import { AgentChatThreadParticipantService } from 'src/engine/metadata-modules/ai/ai-chat/services/agent-chat-thread-participant.service';

const WORKSPACE_ID = 'workspace-id';
const THREAD_ID = 'thread-id';
const WORKER_MEMBER_ID = '11111111-1111-4111-8111-111111111111';
const PUBLIC_READER_MEMBER_ID = '22222222-2222-4222-8222-222222222222';
const WORKER_USER_WORKSPACE_ID = 'reader-user-workspace-id';
const PUBLIC_READER_USER_WORKSPACE_ID = 'outsider-user-workspace-id';

const mention = (workspaceMemberId: string, displayName: string) =>
  `[[record:workspaceMember:${workspaceMemberId}:${displayName}]]`;

const uniqueViolation = () =>
  new QueryFailedError('insert', [], {
    code: '23505',
    message: 'duplicate key value violates unique constraint',
  } as unknown as Error);

const buildService = ({ workers = [WORKER_USER_WORKSPACE_ID] } = {}) => {
  const participantRepository = {
    findOne: jest.fn().mockResolvedValue(null),
    update: jest.fn().mockResolvedValue({ affected: 0 }),
    insertAndReturnOne: jest.fn().mockResolvedValue({ id: 'participant-id' }),
  };

  // The worker predicate is a set of OR-ed clauses; a worker is whoever one of
  // them names, which here is whoever is in the workers list.
  const threadRepository = {
    findOne: jest.fn().mockImplementation((_workspaceId, { where }) => {
      const userWorkspaceId = where[0]?.userWorkspaceId;

      return Promise.resolve(
        workers.includes(userWorkspaceId) ? { id: THREAD_ID } : null,
      );
    }),
  };

  const userWorkspaceService = {
    getWorkspaceMember: jest
      .fn()
      .mockImplementation(
        ({ workspaceMemberId }: { workspaceMemberId: string }) =>
          Promise.resolve({
            id: workspaceMemberId,
            userId: `user-${workspaceMemberId}`,
          }),
      ),
    getUserWorkspaceForUser: jest
      .fn()
      .mockImplementation(({ userId }: { userId: string }) =>
        Promise.resolve({
          id:
            userId === `user-${WORKER_MEMBER_ID}`
              ? WORKER_USER_WORKSPACE_ID
              : PUBLIC_READER_USER_WORKSPACE_ID,
        }),
      ),
  };

  const service = new AgentChatThreadParticipantService(
    participantRepository as never,
    threadRepository as never,
    { findOne: jest.fn() } as never,
    { getThreadById: jest.fn() } as never,
    { publish: jest.fn() } as never,
    userWorkspaceService as never,
  );

  return { service, participantRepository, threadRepository };
};

describe('AgentChatThreadParticipantService mentions', () => {
  it('puts the thread in the list of somebody who can already read it', async () => {
    const { service, participantRepository } = buildService();

    const mentioned = await service.recordMentionsFromMessage({
      threadId: THREAD_ID,
      text: `Can you take this, ${mention(WORKER_MEMBER_ID, 'Ada Lovelace')}?`,
      workspaceId: WORKSPACE_ID,
    });

    expect(mentioned).toEqual([WORKER_USER_WORKSPACE_ID]);
    expect(participantRepository.insertAndReturnOne).toHaveBeenCalledWith(
      WORKSPACE_ID,
      expect.objectContaining({
        threadId: THREAD_ID,
        userWorkspaceId: WORKER_USER_WORKSPACE_ID,
      }),
    );
  });

  it('does not hand the thread to somebody who only reads it', async () => {
    const { service, participantRepository } = buildService();

    const mentioned = await service.recordMentionsFromMessage({
      threadId: THREAD_ID,
      text: `Looping in ${mention(PUBLIC_READER_MEMBER_ID, 'Grace Hopper')}`,
      workspaceId: WORKSPACE_ID,
    });

    expect(mentioned).toEqual([]);
    expect(participantRepository.insertAndReturnOne).not.toHaveBeenCalled();
  });

  it('keeps the workers when a message names a worker and a reader together', async () => {
    const { service } = buildService();

    const mentioned = await service.recordMentionsFromMessage({
      threadId: THREAD_ID,
      text: `${mention(WORKER_MEMBER_ID, 'Ada')} and ${mention(PUBLIC_READER_MEMBER_ID, 'Grace')}`,
      workspaceId: WORKSPACE_ID,
    });

    expect(mentioned).toEqual([WORKER_USER_WORKSPACE_ID]);
  });

  it('only freshens the mention time for somebody already in the thread', async () => {
    const { service, participantRepository } = buildService();

    participantRepository.update.mockResolvedValue({ affected: 1 });

    await service.recordMentionsFromMessage({
      threadId: THREAD_ID,
      text: mention(WORKER_MEMBER_ID, 'Ada'),
      workspaceId: WORKSPACE_ID,
    });

    expect(participantRepository.update).toHaveBeenCalledWith(
      WORKSPACE_ID,
      { threadId: THREAD_ID, userWorkspaceId: WORKER_USER_WORKSPACE_ID },
      expect.objectContaining({ lastMentionedAt: expect.any(Date) }),
    );
    expect(participantRepository.insertAndReturnOne).not.toHaveBeenCalled();
  });

  it('records the mention time when another mention wins the race to create the row', async () => {
    const { service, participantRepository } = buildService();

    participantRepository.insertAndReturnOne.mockRejectedValue(
      uniqueViolation(),
    );

    await service.recordMentionsFromMessage({
      threadId: THREAD_ID,
      text: mention(WORKER_MEMBER_ID, 'Ada'),
      workspaceId: WORKSPACE_ID,
    });

    expect(participantRepository.update).toHaveBeenCalledTimes(2);
    expect(participantRepository.update).toHaveBeenLastCalledWith(
      WORKSPACE_ID,
      { threadId: THREAD_ID, userWorkspaceId: WORKER_USER_WORKSPACE_ID },
      expect.objectContaining({ lastMentionedAt: expect.any(Date) }),
    );
  });

  it('lets an insert failure that is not the race surface', async () => {
    const { service, participantRepository } = buildService();

    participantRepository.insertAndReturnOne.mockRejectedValue(
      new Error('connection terminated'),
    );

    await expect(
      service.recordMentionsFromMessage({
        threadId: THREAD_ID,
        text: mention(WORKER_MEMBER_ID, 'Ada'),
        workspaceId: WORKSPACE_ID,
      }),
    ).rejects.toThrow('connection terminated');
  });

  it('leaves a message that names nobody alone', async () => {
    const { service, threadRepository } = buildService();

    expect(
      await service.recordMentionsFromMessage({
        threadId: THREAD_ID,
        text: 'No mentions here',
        workspaceId: WORKSPACE_ID,
      }),
    ).toEqual([]);
    expect(threadRepository.findOne).not.toHaveBeenCalled();
  });

  // A participant row is itself a clause in the worker predicate, so the row a
  // mention writes must not be handed to somebody the public-channel clause
  // alone lets in: the reader predicate would, the worker predicate does not.
  it('asks the worker predicate, which has no public-channel clause', async () => {
    const { service, threadRepository } = buildService();

    await service.recordMentionsFromMessage({
      threadId: THREAD_ID,
      text: mention(WORKER_MEMBER_ID, 'Ada'),
      workspaceId: WORKSPACE_ID,
    });

    const [, { where }] = threadRepository.findOne.mock.calls[0];

    expect(
      where.some(
        (clause: Record<string, unknown>) =>
          'assigneeUserWorkspaceId' in clause,
      ),
    ).toBe(true);
    // The reader builder's public clause nests it — { channel: { visibility } }
    // — so a top-level key check passes for both builders and guards nothing.
    // The worker builder pins that visibility too, but only alongside the
    // assignee, where it narrows the clause instead of admitting a reader.
    expect(
      where.some(
        (clause: {
          assigneeUserWorkspaceId?: string;
          channel?: Record<string, unknown>;
        }) =>
          isDefined(clause.channel) &&
          'visibility' in clause.channel &&
          !isDefined(clause.assigneeUserWorkspaceId),
      ),
    ).toBe(false);
  });
});
