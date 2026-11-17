import { BroadcastChannel as NodeBroadcastChannel } from 'worker_threads';

import { INBOX_NOTIFICATION_TAB_CHANNEL_NAME } from '@/inbox/constants/InboxNotificationTabChannelName';
import { INBOX_NOTIFICATION_TAB_MESSAGE_TYPE } from '@/inbox/constants/InboxNotificationTabMessageType';
import { isAnotherTabFocused } from '@/inbox/utils/isAnotherTabFocused';

class UnrefBroadcastChannel extends NodeBroadcastChannel {
  constructor(name: string) {
    super(name);
    this.unref();
  }
}

describe('isAnotherTabFocused', () => {
  let otherTabChannel: BroadcastChannel;

  beforeAll(() => {
    Object.defineProperty(globalThis, 'BroadcastChannel', {
      value: UnrefBroadcastChannel,
      configurable: true,
    });
  });

  beforeEach(() => {
    otherTabChannel = new BroadcastChannel(INBOX_NOTIFICATION_TAB_CHANNEL_NAME);
  });

  afterEach(() => {
    otherTabChannel.close();
  });

  afterAll(() => {
    Reflect.deleteProperty(globalThis, 'BroadcastChannel');
  });

  it('should report a focused tab when another tab answers', async () => {
    otherTabChannel.onmessage = (event: MessageEvent<{ type: string }>) => {
      if (
        event.data.type ===
        INBOX_NOTIFICATION_TAB_MESSAGE_TYPE.FOCUSED_TAB_REQUEST
      ) {
        otherTabChannel.postMessage({
          type: INBOX_NOTIFICATION_TAB_MESSAGE_TYPE.FOCUSED_TAB_RESPONSE,
        });
      }
    };

    await expect(isAnotherTabFocused()).resolves.toBe(true);
  });

  it('should report no focused tab when no tab answers', async () => {
    await expect(isAnotherTabFocused()).resolves.toBe(false);
  });
});
