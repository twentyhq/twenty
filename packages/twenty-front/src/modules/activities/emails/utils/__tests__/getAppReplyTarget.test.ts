import { getAppReplyTarget } from '@/activities/emails/utils/getAppReplyTarget';
import { ConnectedAccountProvider } from 'twenty-shared/types';

const APP_REPLY_CONTEXT = {
  loading: false as const,
  to: 'ada@example.com',
  subject: 'Re: Hello',
  inReplyTo: '',
  connectedAccountId: 'app-account',
  connectedAccountProvider: ConnectedAccountProvider.APP,
  messageChannelHandle: 'support@example.com',
};

describe('getAppReplyTarget', () => {
  it('sends from the message channel handle, which can differ from the connection', () => {
    expect(
      getAppReplyTarget({
        replyContext: APP_REPLY_CONTEXT,
        messageChannelId: 'channel-1',
        messageThreadId: 'thread-1',
      }),
    ).toEqual({
      connectedAccountId: 'app-account',
      handle: 'support@example.com',
      messageChannelId: 'channel-1',
      messageThreadId: 'thread-1',
    });
  });

  it('returns nothing for accounts that are not apps', () => {
    expect(
      getAppReplyTarget({
        replyContext: {
          ...APP_REPLY_CONTEXT,
          connectedAccountProvider: ConnectedAccountProvider.GOOGLE,
        },
        messageChannelId: 'channel-1',
        messageThreadId: 'thread-1',
      }),
    ).toBeNull();
  });
});
