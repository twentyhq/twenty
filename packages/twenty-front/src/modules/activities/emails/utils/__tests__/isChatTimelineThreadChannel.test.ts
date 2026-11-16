import { isChatTimelineThreadChannel } from '@/activities/emails/utils/isChatTimelineThreadChannel';
import { MessageChannelType } from '~/generated/graphql';

describe('isChatTimelineThreadChannel', () => {
  it('follows the style the messaging provider declares', () => {
    expect(
      isChatTimelineThreadChannel({
        type: MessageChannelType.APP,
        conversationStyle: 'email',
      }),
    ).toBe(false);
    expect(
      isChatTimelineThreadChannel({
        type: MessageChannelType.APP,
        conversationStyle: 'chat',
      }),
    ).toBe(true);
  });

  it('lays out app channels as chat when no style is declared', () => {
    expect(
      isChatTimelineThreadChannel({
        type: MessageChannelType.APP,
        conversationStyle: null,
      }),
    ).toBe(true);
    expect(
      isChatTimelineThreadChannel({
        type: MessageChannelType.EMAIL,
        conversationStyle: null,
      }),
    ).toBe(false);
  });

  it('lays out a thread with no known channel as email', () => {
    expect(isChatTimelineThreadChannel(null)).toBe(false);
  });
});
