import { filterNewParticipantMentions } from '@/ai/utils/filterNewParticipantMentions';

const participantMentions = [
  { workspaceMemberId: 'jane', label: 'Jane Austen' },
  { workspaceMemberId: 'jony', label: 'Jony Ive' },
  { workspaceMemberId: 'phil', label: 'Phil Schiller' },
  { workspaceMemberId: 'tim', label: 'Tim Apple' },
];

describe('filterNewParticipantMentions', () => {
  it('leaves out the sender, the owner and members already following', () => {
    expect(
      filterNewParticipantMentions({
        participantMentions,
        thread: { workspaceMemberId: 'jane', writerWorkspaceMemberIds: ['jony'] },
        currentWorkspaceMemberId: 'tim',
      }),
    ).toEqual([{ workspaceMemberId: 'phil', label: 'Phil Schiller' }]);
  });

  it('only leaves out the sender of a chat that does not exist yet', () => {
    expect(
      filterNewParticipantMentions({
        participantMentions,
        thread: null,
        currentWorkspaceMemberId: 'tim',
      }),
    ).toEqual(participantMentions.slice(0, 3));
  });
});
