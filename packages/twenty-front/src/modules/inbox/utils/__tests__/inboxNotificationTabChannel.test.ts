import { BroadcastChannel as NodeBroadcastChannel } from 'worker_threads';

import {
  answerFocusedTabRequestsFromOtherTabs,
  isAnotherTabFocused,
} from '@/inbox/utils/inboxNotificationTabChannel';

class UnrefBroadcastChannel extends NodeBroadcastChannel {
  constructor(name: string) {
    super(name);
    this.unref();
  }
}

const waitForDelivery = () => new Promise((resolve) => setTimeout(resolve, 50));

const INBOX_NOTIFICATION_TAB_CHANNEL_NAME = 'twenty-inbox-notification-tabs';

const getMessageData = (event: unknown) =>
  (event as MessageEvent<{ type: string }>).data;

describe('inboxNotificationTabChannel', () => {
  let otherTabChannel: UnrefBroadcastChannel;

  beforeAll(() => {
    Object.defineProperty(globalThis, 'BroadcastChannel', {
      value: UnrefBroadcastChannel,
      configurable: true,
    });
    Object.defineProperty(document, 'visibilityState', {
      value: 'visible',
      configurable: true,
    });
  });

  beforeEach(() => {
    otherTabChannel = new UnrefBroadcastChannel(
      INBOX_NOTIFICATION_TAB_CHANNEL_NAME,
    );
  });

  afterEach(() => {
    otherTabChannel.close();
    jest.restoreAllMocks();
  });

  afterAll(() => {
    Reflect.deleteProperty(globalThis, 'BroadcastChannel');
  });

  it('should report a focused tab when another tab answers', async () => {
    otherTabChannel.onmessage = (event) => {
      const message = getMessageData(event);

      if (message.type === 'focused-tab-request') {
        otherTabChannel.postMessage({ type: 'focused-tab-response' });
      }
    };

    await expect(isAnotherTabFocused()).resolves.toBe(true);
  });

  it('should report no focused tab when no tab answers', async () => {
    await expect(isAnotherTabFocused()).resolves.toBe(false);
  });

  it('should answer only while this tab is focused', async () => {
    const responses: { type: string }[] = [];

    otherTabChannel.onmessage = (event) => {
      responses.push(getMessageData(event));
    };

    const stopAnswering = answerFocusedTabRequestsFromOtherTabs();

    jest.spyOn(document, 'hasFocus').mockReturnValue(false);
    otherTabChannel.postMessage({ type: 'focused-tab-request' });
    await waitForDelivery();

    jest.spyOn(document, 'hasFocus').mockReturnValue(true);
    otherTabChannel.postMessage({ type: 'focused-tab-request' });
    await waitForDelivery();

    stopAnswering();

    expect(responses).toEqual([{ type: 'focused-tab-response' }]);
  });
});
