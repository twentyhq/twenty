import { beforeEach, describe, expect, it, vi } from 'vitest';

import { enqueueSlackAssistantRequest } from 'src/logic-functions/utils/enqueue-slack-assistant-request';

const {
  coreApiClientMock,
  isSlackChannelSilencedMock,
  gateSlackThreadFollowUpMock,
  enqueueSlackAssistantRequestRecordMock,
  replyToEmptySlackAssistantRequestMock,
} = vi.hoisted(() => ({
  coreApiClientMock: vi.fn(),
  isSlackChannelSilencedMock: vi.fn(),
  gateSlackThreadFollowUpMock: vi.fn(),
  enqueueSlackAssistantRequestRecordMock: vi.fn(),
  replyToEmptySlackAssistantRequestMock: vi.fn(),
}));

vi.mock('twenty-client-sdk/core', () => ({
  CoreApiClient: coreApiClientMock,
}));

vi.mock('src/logic-functions/utils/is-slack-channel-silenced', () => ({
  isSlackChannelSilenced: isSlackChannelSilencedMock,
}));

vi.mock('src/logic-functions/utils/gate-slack-thread-follow-up', () => ({
  gateSlackThreadFollowUp: gateSlackThreadFollowUpMock,
}));

vi.mock(
  'src/logic-functions/utils/enqueue-slack-assistant-request-record',
  () => ({
    enqueueSlackAssistantRequestRecord: enqueueSlackAssistantRequestRecordMock,
  }),
);

vi.mock(
  'src/logic-functions/utils/reply-to-empty-slack-assistant-request',
  () => ({
    replyToEmptySlackAssistantRequest: replyToEmptySlackAssistantRequestMock,
  }),
);

const BOT_USER_ID = 'U0BOT';

const buildBody = (event: Record<string, unknown>) => ({
  type: 'event_callback' as const,
  event_id: 'Ev123',
  team_id: 'T0INSTALLED',
  authorizations: [{ user_id: BOT_USER_ID }],
  event: {
    ts: '1700000000.000100',
    user: 'U123',
    ...event,
  },
});

const MENTION_BODY = buildBody({
  type: 'app_mention',
  channel: 'C0FIN',
  text: `<@${BOT_USER_ID}> how many open deals?`,
});

const EMPTY_MENTION_BODY = buildBody({
  type: 'app_mention',
  channel: 'C0FIN',
  text: `<@${BOT_USER_ID}>`,
});

const DIRECT_MESSAGE_BODY = buildBody({
  type: 'message',
  channel: 'D123',
  channel_type: 'im',
  text: 'how many open deals?',
});

const THREAD_FOLLOW_UP_BODY = buildBody({
  type: 'message',
  channel: 'C0FIN',
  channel_type: 'channel',
  thread_ts: '1700000000.000001',
  text: 'and last quarter?',
});

describe('enqueueSlackAssistantRequest', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    coreApiClientMock.mockImplementation(function () {
      return {};
    });
    isSlackChannelSilencedMock.mockResolvedValue(false);
    gateSlackThreadFollowUpMock.mockResolvedValue(undefined);
    enqueueSlackAssistantRequestRecordMock.mockResolvedValue({
      ok: true,
      request: { id: 'request-1' },
    });
    replyToEmptySlackAssistantRequestMock.mockResolvedValue({ ok: true });
  });

  it('should record a mention in a channel with no silencing rule', async () => {
    const result = await enqueueSlackAssistantRequest(MENTION_BODY);

    expect(result).toEqual({ ok: true, request: { id: 'request-1' } });
    expect(isSlackChannelSilencedMock).toHaveBeenCalledWith(
      expect.objectContaining({ slackChannelId: 'C0FIN' }),
    );
  });

  it('should drop a mention in a silenced channel before recording anything', async () => {
    isSlackChannelSilencedMock.mockResolvedValue(true);

    const result = await enqueueSlackAssistantRequest(MENTION_BODY);

    expect(result).toEqual({
      ok: true,
      skipped: 'Channel is silenced by a channel rule',
    });
    expect(enqueueSlackAssistantRequestRecordMock).not.toHaveBeenCalled();
  });

  it('should drop an empty mention in a silenced channel without replying', async () => {
    isSlackChannelSilencedMock.mockResolvedValue(true);

    const result = await enqueueSlackAssistantRequest(EMPTY_MENTION_BODY);

    expect(result).toEqual({
      ok: true,
      skipped: 'Channel is silenced by a channel rule',
    });
    expect(replyToEmptySlackAssistantRequestMock).not.toHaveBeenCalled();
  });

  it('should still answer an empty mention in a channel that is not silenced', async () => {
    await enqueueSlackAssistantRequest(EMPTY_MENTION_BODY);

    expect(replyToEmptySlackAssistantRequestMock).toHaveBeenCalledTimes(1);
  });

  it('should never read channel rules for a direct message', async () => {
    const result = await enqueueSlackAssistantRequest(DIRECT_MESSAGE_BODY);

    expect(result).toEqual({ ok: true, request: { id: 'request-1' } });
    expect(isSlackChannelSilencedMock).not.toHaveBeenCalled();
  });

  it('should drop a thread follow-up in a silenced channel before the thread gate can nudge it', async () => {
    isSlackChannelSilencedMock.mockResolvedValue(true);

    const result = await enqueueSlackAssistantRequest(THREAD_FOLLOW_UP_BODY);

    expect(result).toEqual({
      ok: true,
      skipped: 'Channel is silenced by a channel rule',
    });
    expect(gateSlackThreadFollowUpMock).not.toHaveBeenCalled();
  });

  it('should keep gating thread follow-ups by subscription when the channel is not silenced', async () => {
    gateSlackThreadFollowUpMock.mockResolvedValue({
      ok: true,
      skipped: 'Thread is not subscribed for unmentioned follow-ups',
    });

    const result = await enqueueSlackAssistantRequest(THREAD_FOLLOW_UP_BODY);

    expect(result).toEqual({
      ok: true,
      skipped: 'Thread is not subscribed for unmentioned follow-ups',
    });
    expect(enqueueSlackAssistantRequestRecordMock).not.toHaveBeenCalled();
  });

  it('should let a failed rule read propagate so Slack retries the event', async () => {
    isSlackChannelSilencedMock.mockRejectedValue(new Error('db down'));

    await expect(enqueueSlackAssistantRequest(MENTION_BODY)).rejects.toThrow(
      'db down',
    );
    expect(enqueueSlackAssistantRequestRecordMock).not.toHaveBeenCalled();
  });
});
