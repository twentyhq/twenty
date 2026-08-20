import { type CoreApiClient } from 'twenty-client-sdk/core';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { SLACK_ASSISTANT_REQUEST_STATUS } from 'src/logic-functions/constants/slack-assistant-request-status';
import { SLACK_ASSISTANT_UNLINKED_USER_TEXT } from 'src/logic-functions/constants/slack-assistant-unlinked-user-text';
import { refuseUnlinkedSlackAssistantRequest } from 'src/logic-functions/utils/refuse-unlinked-slack-assistant-request';

const {
  postEphemeralMessageMock,
  postMessageMock,
  updateSlackAssistantRequestMock,
} = vi.hoisted(() => ({
  postEphemeralMessageMock: vi.fn(),
  postMessageMock: vi.fn(),
  updateSlackAssistantRequestMock: vi.fn(),
}));

vi.mock(
  'src/logic-functions/handlers/slack-post-ephemeral-message-handler',
  () => ({ slackPostEphemeralMessageHandler: postEphemeralMessageMock }),
);

vi.mock('src/logic-functions/handlers/slack-post-message-handler', () => ({
  slackPostMessageHandler: postMessageMock,
}));

vi.mock('src/logic-functions/data/update-slack-assistant-request', () => ({
  updateSlackAssistantRequest: updateSlackAssistantRequestMock,
}));

const client = {} as CoreApiClient;

const refusalContext = {
  client,
  requestId: 'request-1',
  slackChannelId: 'C0123456789',
  slackUserId: 'U0123456789',
  parentMessageTimestamp: '1700000000.000100',
};

const expectRequestMarkedRefused = () => {
  expect(updateSlackAssistantRequestMock).toHaveBeenCalledWith(client, {
    id: refusalContext.requestId,
    status: SLACK_ASSISTANT_REQUEST_STATUS.REFUSED,
    errorMessage: expect.any(String),
  });
};

describe('refuseUnlinkedSlackAssistantRequest', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    postEphemeralMessageMock.mockResolvedValue({ success: true });
    postMessageMock.mockResolvedValue({ success: true });
    updateSlackAssistantRequestMock.mockResolvedValue(undefined);
  });

  it('should tell the requester privately and mark the request refused', async () => {
    const result = await refuseUnlinkedSlackAssistantRequest(refusalContext);

    expect(postEphemeralMessageMock).toHaveBeenCalledWith(
      expect.objectContaining({
        slackChannelId: refusalContext.slackChannelId,
        recipientSlackUserId: refusalContext.slackUserId,
        messageText: SLACK_ASSISTANT_UNLINKED_USER_TEXT,
        parentMessageTimestamp: refusalContext.parentMessageTimestamp,
      }),
    );
    expect(postMessageMock).not.toHaveBeenCalled();
    expectRequestMarkedRefused();
    expect(result.refused).toBe(true);
  });

  it('should fall back to a thread reply when the ephemeral cannot be delivered', async () => {
    postEphemeralMessageMock.mockResolvedValue({
      success: false,
      message: 'Failed to post Slack ephemeral message',
    });

    await refuseUnlinkedSlackAssistantRequest(refusalContext);

    expect(postMessageMock).toHaveBeenCalledWith(
      expect.objectContaining({
        slackChannelId: refusalContext.slackChannelId,
        messageText: SLACK_ASSISTANT_UNLINKED_USER_TEXT,
        parentMessageTimestamp: refusalContext.parentMessageTimestamp,
      }),
    );
  });

  it('should reply in the thread when the requester is unknown', async () => {
    await refuseUnlinkedSlackAssistantRequest({
      ...refusalContext,
      slackUserId: undefined,
    });

    expect(postEphemeralMessageMock).not.toHaveBeenCalled();
    expect(postMessageMock).toHaveBeenCalledOnce();
  });

  it('should mark the request refused even when no reply reaches Slack', async () => {
    postEphemeralMessageMock.mockResolvedValue({ success: false });
    postMessageMock.mockResolvedValue({ success: false });

    await refuseUnlinkedSlackAssistantRequest(refusalContext);

    expectRequestMarkedRefused();
  });
});
