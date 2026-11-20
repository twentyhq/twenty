import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { SLACK_ASSISTANT_INTERRUPTED_ERROR } from 'src/logic-functions/constants/slack-assistant-interrupted-error';
import { SLACK_ASSISTANT_INTERRUPTED_FAILURE_TEXT } from 'src/logic-functions/constants/slack-assistant-interrupted-failure-text';
import { SLACK_ASSISTANT_REQUEST_TIMEOUT_SECONDS } from 'src/logic-functions/constants/slack-assistant-request-timeout-seconds';
import { SLACK_ASSISTANT_REQUEST_WATCHDOG_MAX_ATTEMPTS } from 'src/logic-functions/constants/slack-assistant-request-watchdog-max-attempts';
import { slackAssistantRequestWatchdogHandler } from 'src/logic-functions/handlers/slack-assistant-request-watchdog-handler';

const {
  findRequestMock,
  failStaleRequestMock,
  enqueueWatchdogMock,
  enqueueDeliveryMock,
  sendSlackMessageMock,
  resolveSlackClientMock,
  setStatusMock,
} = vi.hoisted(() => ({
  findRequestMock: vi.fn(),
  failStaleRequestMock: vi.fn(),
  enqueueWatchdogMock: vi.fn(),
  enqueueDeliveryMock: vi.fn(),
  sendSlackMessageMock: vi.fn(),
  resolveSlackClientMock: vi.fn(),
  setStatusMock: vi.fn(),
}));

vi.mock('src/logic-functions/data/find-slack-assistant-request-by-id', () => ({
  findSlackAssistantRequestById: findRequestMock,
}));

vi.mock('src/logic-functions/data/fail-stale-slack-assistant-request', () => ({
  failStaleSlackAssistantRequest: failStaleRequestMock,
}));

vi.mock(
  'src/logic-functions/utils/enqueue-slack-assistant-request-watchdog',
  () => ({ enqueueSlackAssistantRequestWatchdog: enqueueWatchdogMock }),
);

vi.mock('src/logic-functions/utils/enqueue-slack-message-delivery', () => ({
  enqueueSlackMessageDelivery: enqueueDeliveryMock,
}));

vi.mock('src/logic-functions/utils/send-slack-message', () => ({
  sendSlackMessage: sendSlackMessageMock,
}));

vi.mock('src/logic-functions/utils/resolve-best-effort-slack-client', () => ({
  resolveBestEffortSlackClient: resolveSlackClientMock,
}));

vi.mock('src/logic-functions/utils/set-slack-assistant-status', () => ({
  setSlackAssistantStatus: setStatusMock,
}));

vi.mock('twenty-client-sdk/core', () => ({
  CoreApiClient: class {},
}));

const NOW = new Date('2026-09-09T12:00:00.000Z');
const REQUEST_ID = '7b1a0f2e-1c2d-4a3b-9e8f-0a1b2c3d4e5f';
const CHANNEL_ID = 'C0123456789';
const THREAD_TIMESTAMP = '1700000000.000100';
const MESSAGE_TIMESTAMP = '1700000000.000200';

const secondsAgo = (seconds: number): string =>
  new Date(NOW.getTime() - seconds * 1000).toISOString();

const STALE_UPDATED_AT = secondsAgo(
  SLACK_ASSISTANT_REQUEST_TIMEOUT_SECONDS + 1,
);
const FRESH_UPDATED_AT = secondsAgo(
  SLACK_ASSISTANT_REQUEST_TIMEOUT_SECONDS - 1,
);

const buildRequest = (overrides: { status: string; updatedAt?: string }) => ({
  id: REQUEST_ID,
  slackChannelId: CHANNEL_ID,
  slackThreadTimestamp: THREAD_TIMESTAMP,
  slackMessageTimestamp: MESSAGE_TIMESTAMP,
  updatedAt: STALE_UPDATED_AT,
  ...overrides,
});

const INTERRUPTED_REPLY = {
  slackChannelId: CHANNEL_ID,
  messageText: SLACK_ASSISTANT_INTERRUPTED_FAILURE_TEXT,
  parentMessageTimestamp: THREAD_TIMESTAMP,
};

describe('slackAssistantRequestWatchdogHandler', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.useFakeTimers();
    vi.setSystemTime(NOW);
    resolveSlackClientMock.mockResolvedValue({});
    sendSlackMessageMock.mockResolvedValue({
      success: true,
      message: 'Message posted to Slack.',
    });
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it.each(['DONE', 'FAILED', 'DECLINED'])(
    'should leave a %s request alone',
    async (status) => {
      findRequestMock.mockResolvedValue(buildRequest({ status }));

      const result = await slackAssistantRequestWatchdogHandler({
        slackAssistantRequestId: REQUEST_ID,
      });

      expect(result).toMatchObject({ isFailed: false, isRescheduled: false });
      expect(failStaleRequestMock).not.toHaveBeenCalled();
      expect(sendSlackMessageMock).not.toHaveBeenCalled();
      expect(setStatusMock).not.toHaveBeenCalled();
      expect(enqueueWatchdogMock).not.toHaveBeenCalled();
    },
  );

  it.each(['PROCESSING', 'PENDING'])(
    'should fail a stale %s request and tell the user once to ask again',
    async (status) => {
      findRequestMock.mockResolvedValue(buildRequest({ status }));
      failStaleRequestMock.mockResolvedValue(true);

      const result = await slackAssistantRequestWatchdogHandler({
        slackAssistantRequestId: REQUEST_ID,
      });

      expect(result).toEqual({ isFailed: true, attempt: 1, hasReplied: true });
      expect(failStaleRequestMock).toHaveBeenCalledExactlyOnceWith(
        expect.objectContaining({
          id: REQUEST_ID,
          errorMessage: SLACK_ASSISTANT_INTERRUPTED_ERROR,
        }),
      );
      expect(setStatusMock).toHaveBeenCalledExactlyOnceWith(
        expect.objectContaining({
          slackChannelId: CHANNEL_ID,
          threadTimestamp: THREAD_TIMESTAMP,
          status: '',
        }),
      );
      expect(sendSlackMessageMock).toHaveBeenCalledExactlyOnceWith(
        INTERRUPTED_REPLY,
        { waitOutRateLimit: false },
      );
      expect(enqueueWatchdogMock).not.toHaveBeenCalled();
      expect(enqueueDeliveryMock).not.toHaveBeenCalled();
    },
  );

  it('should send nothing when another execution finished the request first', async () => {
    findRequestMock.mockResolvedValue(buildRequest({ status: 'PROCESSING' }));
    failStaleRequestMock.mockResolvedValue(false);

    const result = await slackAssistantRequestWatchdogHandler({
      slackAssistantRequestId: REQUEST_ID,
    });

    expect(result).toMatchObject({ isFailed: false, isRescheduled: false });
    expect(sendSlackMessageMock).not.toHaveBeenCalled();
    expect(setStatusMock).not.toHaveBeenCalled();
    expect(enqueueWatchdogMock).not.toHaveBeenCalled();
  });

  it('should check again later when the run is still within its lease', async () => {
    findRequestMock.mockResolvedValue(
      buildRequest({ status: 'PROCESSING', updatedAt: FRESH_UPDATED_AT }),
    );

    const result = await slackAssistantRequestWatchdogHandler({
      slackAssistantRequestId: REQUEST_ID,
    });

    expect(result).toEqual({
      isFailed: false,
      attempt: 1,
      isRescheduled: true,
    });
    expect(enqueueWatchdogMock).toHaveBeenCalledExactlyOnceWith({
      slackAssistantRequestId: REQUEST_ID,
      attempt: 1,
    });
    expect(failStaleRequestMock).not.toHaveBeenCalled();
    expect(sendSlackMessageMock).not.toHaveBeenCalled();
  });

  it('should give up instead of rescheduling once the attempt cap is reached', async () => {
    findRequestMock.mockResolvedValue(
      buildRequest({ status: 'PROCESSING', updatedAt: FRESH_UPDATED_AT }),
    );

    const result = await slackAssistantRequestWatchdogHandler({
      slackAssistantRequestId: REQUEST_ID,
      attempt: SLACK_ASSISTANT_REQUEST_WATCHDOG_MAX_ATTEMPTS,
    });

    expect(result).toMatchObject({ isFailed: false, isRescheduled: false });
    expect(enqueueWatchdogMock).not.toHaveBeenCalled();
    expect(failStaleRequestMock).not.toHaveBeenCalled();
    expect(sendSlackMessageMock).not.toHaveBeenCalled();
  });

  it('should hand a rate limited reply to the delivery job without tying it to the request', async () => {
    findRequestMock.mockResolvedValue(buildRequest({ status: 'PROCESSING' }));
    failStaleRequestMock.mockResolvedValue(true);
    sendSlackMessageMock.mockResolvedValue({
      success: false,
      message: 'Failed to post Slack message',
      error: 'A rate limit was exceeded',
      retryAfterSeconds: 7,
    });

    const result = await slackAssistantRequestWatchdogHandler({
      slackAssistantRequestId: REQUEST_ID,
    });

    expect(result).toEqual({ isFailed: true, attempt: 1, hasReplied: false });
    expect(enqueueDeliveryMock).toHaveBeenCalledExactlyOnceWith({
      payload: INTERRUPTED_REPLY,
      retryAfterSeconds: 7,
    });
  });
});
