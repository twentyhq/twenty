import { AgentChatThreadParticipantService } from 'src/engine/metadata-modules/ai/ai-chat/services/agent-chat-thread-participant.service';

const WORKSPACE_ID = 'workspace-id';
const THREAD_ID = 'thread-id';
const READER_MEMBER_ID = '11111111-1111-4111-8111-111111111111';
const OUTSIDER_MEMBER_ID = '22222222-2222-4222-8222-222222222222';
const READER_USER_WORKSPACE_ID = 'reader-user-workspace-id';
const OUTSIDER_USER_WORKSPACE_ID = 'outsider-user-workspace-id';

const mention = (workspaceMemberId: string, displayName: string) =>
  `[[record:workspaceMember:${workspaceMemberId}:${displayName}]]`;

const buildService = ({ readers = [READER_USER_WORKSPACE_ID] } = {}) => {
  const participantRepository = {
    findOne: jest.fn().mockResolvedValue(null),
    update: jest.fn().mockResolvedValue({ affected: 1 }),
    insertAndReturnOne: jest.fn().mockResolvedValue({ id: 'participant-id' }),
  };

  // The access predicate is a set of OR-ed clauses; a reader is whoever one of
  // them names, which here is whoever is in the readers list.
  const threadRepository = {
    findOne: jest.fn().mockImplementation((_workspaceId, { where }) => {
      const userWorkspaceId = where[0]?.userWorkspaceId;

      return Promise.resolve(
        readers.includes(userWorkspaceId) ? { id: THREAD_ID } : null,
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
            userId === `user-${READER_MEMBER_ID}`
              ? READER_USER_WORKSPACE_ID
              : OUTSIDER_USER_WORKSPACE_ID,
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
      text: `Can you take this, ${mention(READER_MEMBER_ID, 'Ada Lovelace')}?`,
      workspaceId: WORKSPACE_ID,
    });

    expect(mentioned).toEqual([READER_USER_WORKSPACE_ID]);
    expect(participantRepository.insertAndReturnOne).toHaveBeenCalledWith(
      WORKSPACE_ID,
      expect.objectContaining({
        threadId: THREAD_ID,
        userWorkspaceId: READER_USER_WORKSPACE_ID,
      }),
    );
  });

  it('does not hand the thread to somebody who cannot open it', async () => {
    const { service, participantRepository } = buildService();

    const mentioned = await service.recordMentionsFromMessage({
      threadId: THREAD_ID,
      text: `Looping in ${mention(OUTSIDER_MEMBER_ID, 'Grace Hopper')}`,
      workspaceId: WORKSPACE_ID,
    });

    expect(mentioned).toEqual([]);
    expect(participantRepository.insertAndReturnOne).not.toHaveBeenCalled();
  });

  it('keeps the readers when a message names a reader and an outsider together', async () => {
    const { service } = buildService();

    const mentioned = await service.recordMentionsFromMessage({
      threadId: THREAD_ID,
      text: `${mention(READER_MEMBER_ID, 'Ada')} and ${mention(OUTSIDER_MEMBER_ID, 'Grace')}`,
      workspaceId: WORKSPACE_ID,
    });

    expect(mentioned).toEqual([READER_USER_WORKSPACE_ID]);
  });

  it('only freshens the mention time for somebody already in the thread', async () => {
    const { service, participantRepository } = buildService();

    participantRepository.findOne.mockResolvedValue({ id: 'participant-id' });

    await service.recordMentionsFromMessage({
      threadId: THREAD_ID,
      text: mention(READER_MEMBER_ID, 'Ada'),
      workspaceId: WORKSPACE_ID,
    });

    expect(participantRepository.update).toHaveBeenCalledWith(
      WORKSPACE_ID,
      { id: 'participant-id' },
      expect.objectContaining({ lastMentionedAt: expect.any(Date) }),
    );
    expect(participantRepository.insertAndReturnOne).not.toHaveBeenCalled();
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
});
