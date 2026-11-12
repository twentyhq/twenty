import { getAgentChatNewThreadDirectMessageWorkspaceMemberId } from '@/ai/utils/getAgentChatNewThreadDirectMessageWorkspaceMemberId';

const ONE_PERSON_WITHOUT_ADA = {
  isAssistantParticipant: false,
  isAssistantMentioned: false,
  channelId: null,
  recipientWorkspaceMemberIds: ['jane'],
  mentionedWorkspaceMemberIds: [],
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
        mentionedWorkspaceMemberIds: ['jane'],
      }),
    ).toBe('jane');
  });

  it('returns the person mentioned when no recipient is picked', () => {
    expect(
      getAgentChatNewThreadDirectMessageWorkspaceMemberId({
        ...ONE_PERSON_WITHOUT_ADA,
        recipientWorkspaceMemberIds: [],
        mentionedWorkspaceMemberIds: ['jane'],
      }),
    ).toBe('jane');
  });

  it.each([
    ['Ada is a recipient', { isAssistantParticipant: true }],
    ['Ada is mentioned', { isAssistantMentioned: true }],
    ['a channel is picked', { channelId: 'channel' }],
    ['two people are addressed', { mentionedWorkspaceMemberIds: ['bob'] }],
  ])('returns nothing when %s', (_, overrides) => {
    expect(
      getAgentChatNewThreadDirectMessageWorkspaceMemberId({
        ...ONE_PERSON_WITHOUT_ADA,
        ...overrides,
      }),
    ).toBeUndefined();
  });
});
