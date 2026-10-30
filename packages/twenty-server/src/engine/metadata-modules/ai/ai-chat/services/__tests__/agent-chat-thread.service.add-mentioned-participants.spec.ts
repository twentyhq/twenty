import { AgentChatThreadService } from 'src/engine/metadata-modules/ai/ai-chat/services/agent-chat-thread.service';

const ARGS = {
  workspaceId: 'workspace-id',
  workspaceMemberId: 'sender-id',
  threadId: 'thread-id',
};

const buildService = () => {
  const service = new AgentChatThreadService(
    {} as never,
    {} as never,
    {} as never,
    {} as never,
    {} as never,
    {} as never,
  );
  const mentionParticipants = jest
    .spyOn(service, 'mentionParticipants')
    .mockImplementation(({ participantWorkspaceMemberIds }) =>
      Promise.resolve(participantWorkspaceMemberIds),
    );

  return { service, mentionParticipants };
};

describe('AgentChatThreadService.addMentionedParticipants', () => {
  it('mentions the members the message names, leaving its sender out', async () => {
    const { service, mentionParticipants } = buildService();

    await expect(
      service.addMentionedParticipants({
        ...ARGS,
        mentionedWorkspaceMemberIds: ['sender-id', 'other-member-id'],
      }),
    ).resolves.toEqual(['other-member-id']);
    expect(mentionParticipants).toHaveBeenCalledWith({
      ...ARGS,
      participantWorkspaceMemberIds: ['other-member-id'],
    });
  });

  it('mentions no one when the sender only names themselves', async () => {
    const { service, mentionParticipants } = buildService();

    await expect(
      service.addMentionedParticipants({
        ...ARGS,
        mentionedWorkspaceMemberIds: ['sender-id'],
      }),
    ).resolves.toEqual([]);
    expect(mentionParticipants).not.toHaveBeenCalled();
  });
});
