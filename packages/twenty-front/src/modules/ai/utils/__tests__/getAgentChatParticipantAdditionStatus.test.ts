import { getAgentChatParticipantAdditionStatus } from '@/ai/utils/getAgentChatParticipantAdditionStatus';

const INITIAL_RECIPIENT = { workspaceMemberId: 'jane', label: 'Jane' };
const PARTICIPANT_MENTION = { workspaceMemberId: 'jony', label: 'Jony' };

describe('getAgentChatParticipantAdditionStatus', () => {
  it('does not require verification when every requested participant was accepted', () => {
    expect(
      getAgentChatParticipantAdditionStatus({
        initialRecipients: [INITIAL_RECIPIENT],
        participantMentions: [PARTICIPANT_MENTION],
        addedWorkspaceMemberIds: [
          INITIAL_RECIPIENT.workspaceMemberId,
          PARTICIPANT_MENTION.workspaceMemberId,
        ],
      }),
    ).toEqual({ hasUnverifiedInitialRecipients: false, notAddedLabels: '' });
  });

  it('preserves mention warnings while initial recipient membership is unknown', () => {
    expect(
      getAgentChatParticipantAdditionStatus({
        initialRecipients: [INITIAL_RECIPIENT],
        participantMentions: [PARTICIPANT_MENTION],
        addedWorkspaceMemberIds: [],
      }),
    ).toEqual({ hasUnverifiedInitialRecipients: true, notAddedLabels: 'Jony' });
  });

  it('does not warn about recipients delivered before a failed first send', () => {
    expect(
      getAgentChatParticipantAdditionStatus({
        initialRecipients: [INITIAL_RECIPIENT],
        participantMentions: [],
        addedWorkspaceMemberIds: [],
        writerWorkspaceMemberIds: [INITIAL_RECIPIENT.workspaceMemberId],
      }),
    ).toEqual({ hasUnverifiedInitialRecipients: false, notAddedLabels: '' });
  });

  it.each([
    {
      scenario: 'another recipient',
      writerWorkspaceMemberIds: [PARTICIPANT_MENTION.workspaceMemberId],
    },
    { scenario: 'no recorded recipients', writerWorkspaceMemberIds: null },
  ])(
    'warns when a selected recipient is absent from a thread with $scenario',
    ({ writerWorkspaceMemberIds }) => {
      expect(
        getAgentChatParticipantAdditionStatus({
          initialRecipients: [INITIAL_RECIPIENT],
          participantMentions: [],
          addedWorkspaceMemberIds: [],
          writerWorkspaceMemberIds,
        }),
      ).toEqual({
        hasUnverifiedInitialRecipients: false,
        notAddedLabels: 'Jane',
      });
    },
  );

  it('warns about an unconfirmed mention even when its recipient is already a member', () => {
    expect(
      getAgentChatParticipantAdditionStatus({
        initialRecipients: [INITIAL_RECIPIENT],
        participantMentions: [INITIAL_RECIPIENT],
        addedWorkspaceMemberIds: [],
        writerWorkspaceMemberIds: [INITIAL_RECIPIENT.workspaceMemberId],
      }),
    ).toEqual({
      hasUnverifiedInitialRecipients: false,
      notAddedLabels: 'Jane',
    });
  });
});
