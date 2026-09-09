import { beforeEach, describe, expect, it, vi } from 'vitest';

import { SLACK_MESSAGE_DELIVERY_MAX_ATTEMPTS } from 'src/logic-functions/constants/slack-message-delivery-max-attempts';
import { slackDeliverMessageHandler } from 'src/logic-functions/handlers/slack-deliver-message-handler';

const {
  postMessageHandlerMock,
  enqueueDeliveryMock,
  updateRequestMock,
  finishWithFailureMock,
} = vi.hoisted(() => ({
  postMessageHandlerMock: vi.fn(),
  enqueueDeliveryMock: vi.fn(),
  updateRequestMock: vi.fn(),
  finishWithFailureMock: vi.fn(),
}));

vi.mock('src/logic-functions/handlers/slack-post-message-handler', () => ({
  slackPostMessageHandler: postMessageHandlerMock,
}));

vi.mock('src/logic-functions/utils/enqueue-slack-message-delivery', () => ({
  enqueueSlackMessageDelivery: enqueueDeliveryMock,
}));

vi.mock('src/logic-functions/data/update-slack-assistant-request', () => ({
  updateSlackAssistantRequest: updateRequestMock,
}));

vi.mock(
  'src/logic-functions/utils/finish-slack-assistant-request-with-failure',
  () => ({ finishSlackAssistantRequestWithFailure: finishWithFailureMock }),
);

vi.mock('twenty-client-sdk/core', () => ({
  CoreApiClient: class {},
}));

const CHANNEL_ID = 'C0123456789';
const REQUEST_ID = '7b1a0f2e-1c2d-4a3b-9e8f-0a1b2c3d4e5f';

const ANSWER_PAYLOAD = {
  slackChannelId: CHANNEL_ID,
  messageText: 'here is your answer',
  parentMessageTimestamp: '1700000000.000100',
  slackAssistantRequestId: REQUEST_ID,
};

describe('slackDeliverMessageHandler', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should mark the assistant request done once the message is delivered', async () => {
    postMessageHandlerMock.mockResolvedValue({
      success: true,
      message: 'Message posted to Slack.',
    });

    const result = await slackDeliverMessageHandler(ANSWER_PAYLOAD);

    expect(result).toEqual({ delivered: true, attempt: 1 });
    expect(postMessageHandlerMock).toHaveBeenCalledWith(expect.anything(), {
      waitOutRateLimit: false,
    });
    expect(updateRequestMock).toHaveBeenCalledWith(expect.anything(), {
      id: REQUEST_ID,
      status: 'DONE',
      responseText: 'here is your answer',
    });
    expect(enqueueDeliveryMock).not.toHaveBeenCalled();
  });

  it('should reschedule with the delay Slack asked for when still rate limited', async () => {
    postMessageHandlerMock.mockResolvedValue({
      success: false,
      message: 'Failed to post Slack message',
      error: 'A rate limit was exceeded',
      retryAfterSeconds: 12,
    });

    const result = await slackDeliverMessageHandler(ANSWER_PAYLOAD);

    expect(result).toEqual({
      delivered: false,
      attempt: 1,
      rescheduled: true,
    });
    expect(enqueueDeliveryMock).toHaveBeenCalledWith({
      payload: ANSWER_PAYLOAD,
      retryAfterSeconds: 12,
    });
    expect(updateRequestMock).not.toHaveBeenCalled();
    expect(finishWithFailureMock).not.toHaveBeenCalled();
  });

  it('should stop rescheduling and fail the request once the attempt cap is reached', async () => {
    postMessageHandlerMock.mockResolvedValue({
      success: false,
      message: 'Failed to post Slack message',
      error: 'A rate limit was exceeded',
      retryAfterSeconds: 12,
    });

    const result = await slackDeliverMessageHandler({
      ...ANSWER_PAYLOAD,
      attempt: SLACK_MESSAGE_DELIVERY_MAX_ATTEMPTS,
    });

    expect(result.rescheduled).toBe(false);
    expect(enqueueDeliveryMock).not.toHaveBeenCalled();
    expect(finishWithFailureMock).toHaveBeenCalledWith(
      expect.objectContaining({
        requestId: REQUEST_ID,
        slackChannelId: CHANNEL_ID,
        parentMessageTimestamp: '1700000000.000100',
      }),
    );
  });

  it('should not touch any assistant request when the payload carries none', async () => {
    postMessageHandlerMock.mockResolvedValue({
      success: false,
      message: 'Failed to post Slack message',
      error: 'channel_not_found',
    });

    const result = await slackDeliverMessageHandler({
      slackChannelId: CHANNEL_ID,
      messageText: 'consent request',
    });

    expect(result.delivered).toBe(false);
    expect(updateRequestMock).not.toHaveBeenCalled();
    expect(finishWithFailureMock).not.toHaveBeenCalled();
  });
  it('should keep the job successful when the status write fails after posting', async () => {
    postMessageHandlerMock.mockResolvedValue({
      success: true,
      message: 'Message posted to Slack.',
    });
    updateRequestMock.mockRejectedValue(new Error('core api unreachable'));

    const result = await slackDeliverMessageHandler(ANSWER_PAYLOAD);

    expect(result).toEqual({
      delivered: true,
      attempt: 1,
      statusRecorded: false,
    });
    expect(enqueueDeliveryMock).not.toHaveBeenCalled();
  });
});
