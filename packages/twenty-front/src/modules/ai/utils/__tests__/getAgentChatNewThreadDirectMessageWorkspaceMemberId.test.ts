import { getAgentChatNewThreadDirectMessageWorkspaceMemberId } from '@/ai/utils/getAgentChatNewThreadDirectMessageWorkspaceMemberId';

const JANE = { workspaceMemberId: 'jane', label: 'Jane' };
const BOB = { workspaceMemberId: 'bob', label: 'Bob' };

const ONE_PERSON_WITHOUT_ADA = {
  isDirectMessageIdentityEnabled: true,
  newInboxChatRecipients: {
    isAssistantParticipant: false,
    recipientWorkspaceMemberIds: ['jane'],
  },
  isAssistantMentioned: false,
  channelId: null,
  initialRecipients: [JANE],
  participantMentions: [],
};

describe('getAgentChatNewThreadDirectMessageWorkspaceMemberId', () => {
  it('returns the only person addressed when Ada and channels are left out', () => {
    expect(
      getAgentChatNewThreadDirectMessageWorkspaceMemberId(
        ONE_PERSON_WITHOUT_ADA,
      ),
    ).toBe('jane');
  });

  it('counts a person picked and mentioned once', () => {
    expect(
      getAgentChatNewThreadDirectMessageWorkspaceMemberId({
        ...ONE_PERSON_WITHOUT_ADA,
        participantMentions: [JANE],
      }),
    ).toBe('jane');
  });

  it('returns the person mentioned when no recipient is picked', () => {
    expect(
      getAgentChatNewThreadDirectMessageWorkspaceMemberId({
        ...ONE_PERSON_WITHOUT_ADA,
        initialRecipients: [],
        participantMentions: [JANE],
      }),
    ).toBe('jane');
  });

  it.each([
    ['direct messages are disabled', { isDirectMessageIdentityEnabled: false }],
    ['the chat is not a new inbox chat', { newInboxChatRecipients: undefined }],
    [
      'Ada is a recipient',
      {
        newInboxChatRecipients: {
          isAssistantParticipant: true,
          recipientWorkspaceMemberIds: ['jane'],
        },
      },
    ],
    ['Ada is mentioned', { isAssistantMentioned: true }],
    ['a channel is picked', { channelId: 'channel' }],
    ['two people are addressed', { participantMentions: [BOB] }],
  ])('returns nothing when %s', (_, overrides) => {
    expect(
      getAgentChatNewThreadDirectMessageWorkspaceMemberId({
        ...ONE_PERSON_WITHOUT_ADA,
        ...overrides,
      }),
    ).toBeUndefined();
  });
});
