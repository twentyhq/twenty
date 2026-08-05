import { beforeEach, describe, expect, it, vi } from 'vitest';

import { enqueueSlackAssistantRequest } from 'src/logic-functions/utils/enqueue-slack-assistant-request';

const {
  createRequestMock,
  findRequestMock,
  subscriptionStateMock,
  nudgeMock,
  replyToEmptyMock,
} = vi.hoisted(() => ({
  createRequestMock: vi.fn(),
  findRequestMock: vi.fn(),
  subscriptionStateMock: vi.fn(),
  nudgeMock: vi.fn(),
  replyToEmptyMock: vi.fn(),
}));

vi.mock('twenty-client-sdk/core', () => ({
  CoreApiClient: vi.fn(),
}));

vi.mock('src/logic-functions/data/create-slack-assistant-request', () => ({
  createSlackAssistantRequest: createRequestMock,
}));

vi.mock(
  'src/logic-functions/data/find-slack-assistant-request-by-slack-message',
  () => ({
    findSlackAssistantRequestBySlackMessage: findRequestMock,
  }),
);

vi.mock('src/logic-functions/utils/get-slack-thread-subscription-state', () => ({
  getSlackThreadSubscriptionState: subscriptionStateMock,
}));

vi.mock('src/logic-functions/utils/nudge-expired-slack-thread', () => ({
  nudgeExpiredSlackThread: nudgeMock,
}));

vi.mock(
  'src/logic-functions/utils/reply-to-empty-slack-assistant-request',
  () => ({
    replyToEmptySlackAssistantRequest: replyToEmptyMock,
  }),
);

const buildThreadFollowUpBody = (text: string) => ({
  type: 'event_callback',
  event_id: 'EvFollowUp',
  event: {
    type: 'message',
    channel_type: 'channel',
    user: 'U123',
    text,
    ts: '1700000000.000400',
    thread_ts: '1699999999.000001',
    channel: 'C123',
  },
});

describe('enqueueSlackAssistantRequest', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    findRequestMock.mockResolvedValue(undefined);
    createRequestMock.mockResolvedValue(undefined);
  });

  it('should answer an empty mention with the hint reply instead of enqueueing', async () => {
    replyToEmptyMock.mockResolvedValue({ ok: true });

    const result = await enqueueSlackAssistantRequest({
      type: 'event_callback',
      event_id: 'Ev123',
      event: {
        type: 'app_mention',
        user: 'U123',
        text: '<@UBOT>',
        ts: '1700000000.000100',
        channel: 'C123',
      },
    });

    expect(result).toEqual({ ok: true });
    expect(replyToEmptyMock).toHaveBeenCalledWith({
      slackChannelId: 'C123',
      slackMessageTimestamp: '1700000000.000100',
      parentMessageTimestamp: '1700000000.000100',
    });
    expect(createRequestMock).not.toHaveBeenCalled();
  });

  it('should nudge the requester once when the thread subscription expired', async () => {
    subscriptionStateMock.mockResolvedValue('expired');

    const result = await enqueueSlackAssistantRequest(
      buildThreadFollowUpBody('what about the ACME deal?'),
    );

    expect(result.skipped).toBe(
      'Thread subscription expired; nudged the requester',
    );
    expect(nudgeMock).toHaveBeenCalledWith({
      slackChannelId: 'C123',
      slackUserId: 'U123',
      threadTimestamp: '1699999999.000001',
    });
    expect(createRequestMock).not.toHaveBeenCalled();
  });

  it('should stay silent on follow-ups in threads it never joined', async () => {
    subscriptionStateMock.mockResolvedValue('none');

    const result = await enqueueSlackAssistantRequest(
      buildThreadFollowUpBody('unrelated thread chatter'),
    );

    expect(result.skipped).toBe(
      'Thread is not subscribed for unmentioned follow-ups',
    );
    expect(nudgeMock).not.toHaveBeenCalled();
    expect(createRequestMock).not.toHaveBeenCalled();
  });

  it('should enqueue a follow-up while the thread subscription is active', async () => {
    subscriptionStateMock.mockResolvedValue('active');

    const result = await enqueueSlackAssistantRequest(
      buildThreadFollowUpBody('what about the ACME deal?'),
    );

    expect(result).toEqual({ ok: true });
    expect(createRequestMock).toHaveBeenCalledWith(
      expect.anything(),
      expect.objectContaining({
        slackChannelId: 'C123',
        slackThreadTimestamp: '1699999999.000001',
        requestText: 'what about the ACME deal?',
      }),
    );
    expect(nudgeMock).not.toHaveBeenCalled();
  });
});
