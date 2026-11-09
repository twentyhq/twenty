import { isChatTimelineThreadChannel } from '@/activities/emails/utils/isChatTimelineThreadChannel';

describe('isChatTimelineThreadChannel', () => {
  it('lays out a channel whose provider declares chat as a chat', () => {
    expect(isChatTimelineThreadChannel({ conversationStyle: 'chat' })).toBe(
      true,
    );
  });

  it('lays out a channel whose provider declares email, or none, as email', () => {
    expect(isChatTimelineThreadChannel({ conversationStyle: 'email' })).toBe(
      false,
    );
  });

  it('lays out a thread with no known channel as email', () => {
    expect(isChatTimelineThreadChannel(null)).toBe(false);
  });
});
