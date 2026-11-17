import { BroadcastChannel as NodeBroadcastChannel } from 'worker_threads';

import { INBOX_NOTIFICATION_TAB_CHANNEL_NAME } from '@/inbox/constants/InboxNotificationTabChannelName';
import { INBOX_NOTIFICATION_TAB_MESSAGE_TYPE } from '@/inbox/constants/InboxNotificationTabMessageType';
import { answerFocusedTabRequestsFromOtherTabs } from '@/inbox/utils/answerFocusedTabRequestsFromOtherTabs';

class UnrefBroadcastChannel extends NodeBroadcastChannel {
  constructor(name: string) {
    super(name);
    this.unref();
  }
}

const waitForDelivery = () => new Promise((resolve) => setTimeout(resolve, 50));

describe('answerFocusedTabRequestsFromOtherTabs', () => {
  let otherTabChannel: BroadcastChannel;

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
    otherTabChannel = new BroadcastChannel(INBOX_NOTIFICATION_TAB_CHANNEL_NAME);
  });

  afterEach(() => {
    otherTabChannel.close();
    jest.restoreAllMocks();
  });

  afterAll(() => {
    Reflect.deleteProperty(globalThis, 'BroadcastChannel');
  });

  it('should answer only while this tab is focused', async () => {
    const responses: { type: string }[] = [];

    otherTabChannel.onmessage = (event: MessageEvent<{ type: string }>) => {
      responses.push(event.data);
    };

    const stopAnswering = answerFocusedTabRequestsFromOtherTabs();

    jest.spyOn(document, 'hasFocus').mockReturnValue(false);
    otherTabChannel.postMessage({
      type: INBOX_NOTIFICATION_TAB_MESSAGE_TYPE.FOCUSED_TAB_REQUEST,
    });
    await waitForDelivery();

    jest.spyOn(document, 'hasFocus').mockReturnValue(true);
    otherTabChannel.postMessage({
      type: INBOX_NOTIFICATION_TAB_MESSAGE_TYPE.FOCUSED_TAB_REQUEST,
    });
    await waitForDelivery();

    stopAnswering();

    expect(responses).toEqual([
      { type: INBOX_NOTIFICATION_TAB_MESSAGE_TYPE.FOCUSED_TAB_RESPONSE },
    ]);
  });
});
