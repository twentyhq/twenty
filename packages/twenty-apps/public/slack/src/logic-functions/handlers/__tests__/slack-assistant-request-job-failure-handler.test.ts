import { beforeEach, describe, expect, it, vi } from 'vitest';

import { SLACK_ASSISTANT_FAILURE_TEXT } from 'src/logic-functions/constants/slack-assistant-failure-text';
import { slackAssistantRequestJobFailureHandler } from 'src/logic-functions/handlers/slack-assistant-request-job-failure-handler';
import { type SlackEventsRequestBody } from 'src/logic-functions/types/slack-events-request-body.type';

const { findRequestMock, updateRequestMock, postMessageMock, claimReplyMock } =
  vi.hoisted(() => ({
    findRequestMock: vi.fn(),
    updateRequestMock: vi.fn(),
    postMessageMock: vi.fn(),
    claimReplyMock: vi.fn(),
  }));

vi.mock(
  'src/logic-functions/data/find-slack-assistant-request-by-slack-message',
  () => ({ findSlackAssistantRequestBySlackMessage: findRequestMock }),
);

vi.mock('src/logic-functions/data/update-slack-assistant-request', () => ({
  updateSlackAssistantRequest: updateRequestMock,
}));

vi.mock('src/logic-functions/handlers/slack-post-message-handler', () => ({
  slackPostMessageHandler: postMessageMock,
}));

vi.mock('src/logic-functions/utils/claim-slack-job-failure-reply', () => ({
  claimSlackJobFailureReply: claimReplyMock,
}));

vi.mock('twenty-client-sdk/core', () => ({
  CoreApiClient: class {},
}));

const CHANNEL_ID = 'C0123456789';
const MESSAGE_TIMESTAMP = '1700000000.000200';
const THREAD_TIMESTAMP = '1700000000.000100';
const REQUEST_ID = '7b1a0f2e-1c2d-4a3b-9e8f-0a1b2c3d4e5f';

const MENTION_BODY: SlackEventsRequestBody = {
  type: 'event_callback',
  event_id: 'Ev0123456789',
  event: {
    type: 'app_mention',
    channel: CHANNEL_ID,
    ts: MESSAGE_TIMESTAMP,
    thread_ts: THREAD_TIMESTAMP,
    user: 'U0123456789',
    text: '<@U0BOT> how many open deals do we have?',
  },
};

const TIMEOUT_FAILURE = {
  payload: MENTION_BODY,
  error: { type: 'TimeoutError', message: 'Task timed out after 240 seconds' },
  job: { id: 'job-1', attemptsMade: 1 },
};

describe('slackAssistantRequestJobFailureHandler', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    claimReplyMock.mockResolvedValue(true);
  });

  it('should fail an unfinished request and reply in its thread', async () => {
    findRequestMock.mockResolvedValue({
      id: REQUEST_ID,
      status: 'PROCESSING',
      slackThreadTimestamp: THREAD_TIMESTAMP,
    });

    await slackAssistantRequestJobFailureHandler(TIMEOUT_FAILURE);

    expect(findRequestMock).toHaveBeenCalledWith(expect.anything(), {
      slackChannelId: CHANNEL_ID,
      slackMessageTimestamp: MESSAGE_TIMESTAMP,
    });
    expect(postMessageMock).toHaveBeenCalledWith({
      slackChannelId: CHANNEL_ID,
      messageText: SLACK_ASSISTANT_FAILURE_TEXT,
      parentMessageTimestamp: THREAD_TIMESTAMP,
    });
    expect(updateRequestMock).toHaveBeenCalledWith(expect.anything(), {
      id: REQUEST_ID,
      status: 'FAILED',
      errorMessage: 'TimeoutError: Task timed out after 240 seconds',
    });
  });

  it('should still fail the request without replying again when a previous try already replied', async () => {
    findRequestMock.mockResolvedValue({ id: REQUEST_ID, status: 'PROCESSING' });
    claimReplyMock.mockResolvedValue(false);

    await slackAssistantRequestJobFailureHandler(TIMEOUT_FAILURE);

    expect(postMessageMock).not.toHaveBeenCalled();
    expect(updateRequestMock).toHaveBeenCalledWith(
      expect.anything(),
      expect.objectContaining({ id: REQUEST_ID, status: 'FAILED' }),
    );
  });

  it.each(['DONE', 'FAILED', 'DECLINED'])(
    'should leave a %s request untouched',
    async (status) => {
      findRequestMock.mockResolvedValue({ id: REQUEST_ID, status });

      const result =
        await slackAssistantRequestJobFailureHandler(TIMEOUT_FAILURE);

      expect(result).toEqual({
        skipped: true,
        reason: 'Request is already finished',
      });
      expect(postMessageMock).not.toHaveBeenCalled();
      expect(updateRequestMock).not.toHaveBeenCalled();
    },
  );

  it('should skip when the run never recorded a request', async () => {
    findRequestMock.mockResolvedValue(undefined);

    await slackAssistantRequestJobFailureHandler(TIMEOUT_FAILURE);

    expect(postMessageMock).not.toHaveBeenCalled();
    expect(updateRequestMock).not.toHaveBeenCalled();
  });

  it('should skip a payload that is not an assistant request', async () => {
    const result = await slackAssistantRequestJobFailureHandler({
      ...TIMEOUT_FAILURE,
      payload: { type: 'url_verification', challenge: 'challenge' },
    });

    expect(result).toEqual({
      skipped: true,
      reason: 'Unhandled body type: url_verification',
    });
    expect(findRequestMock).not.toHaveBeenCalled();
  });
});
