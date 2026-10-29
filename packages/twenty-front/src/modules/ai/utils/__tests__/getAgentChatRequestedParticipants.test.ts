import { getAgentChatRequestedParticipants } from '@/ai/utils/getAgentChatRequestedParticipants';

describe('getAgentChatRequestedParticipants', () => {
  it('uses the last label for a duplicated member', () => {
    expect(
      getAgentChatRequestedParticipants({
        participantMentions: [
          { workspaceMemberId: 'jane', label: 'Mention label' },
        ],
        initialRecipients: [
          { workspaceMemberId: 'jane', label: 'Previous recipient label' },
          { workspaceMemberId: 'jane', label: 'Current recipient label' },
        ],
      }),
    ).toEqual([
      { workspaceMemberId: 'jane', label: 'Current recipient label' },
    ]);
  });

  it('keeps first appearance order when later recipients replace earlier mentions', () => {
    const participants = getAgentChatRequestedParticipants({
      participantMentions: [
        { workspaceMemberId: 'jony', label: 'Jony' },
        { workspaceMemberId: 'jane', label: 'Jane' },
      ],
      initialRecipients: [
        { workspaceMemberId: 'phil', label: 'Phil' },
        { workspaceMemberId: 'jane', label: 'Jane recipient' },
        { workspaceMemberId: 'tim', label: 'Tim' },
        { workspaceMemberId: 'jony', label: 'Jony recipient' },
      ],
    });

    expect(
      participants.map(({ workspaceMemberId }) => workspaceMemberId),
    ).toEqual(['jony', 'jane', 'phil', 'tim']);
  });
});
