import { beforeEach, describe, expect, it, vi } from 'vitest';

import { sendSlackUserLinkConsentDm } from 'src/logic-functions/utils/send-slack-user-link-consent-dm';

const { postSlackMessageMock, enqueueDeliveryMock } = vi.hoisted(() => ({
  postSlackMessageMock: vi.fn(),
  enqueueDeliveryMock: vi.fn(),
}));

vi.mock('src/logic-functions/utils/post-slack-message', () => ({
  postSlackMessage: postSlackMessageMock,
}));

vi.mock('src/logic-functions/utils/enqueue-slack-message-delivery', () => ({
  enqueueSlackMessageDelivery: enqueueDeliveryMock,
}));

const DM_CHANNEL_ID = 'D0123456789';

const CONSENT_REQUEST = {
  slackTeamId: 'T1',
  slackUserId: 'U1',
  workspaceMemberId: 'member-1',
  slackUserLinkId: 'link-1',
  memberName: 'Ada Member',
};

const buildSlackClient = (openResult: unknown) =>
  ({
    conversations: { open: vi.fn().mockResolvedValue(openResult) },
  }) as never;

describe('sendSlackUserLinkConsentDm', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should post the consent request in the opened direct message', async () => {
    postSlackMessageMock.mockResolvedValue({ success: true, message: 'ok' });

    const result = await sendSlackUserLinkConsentDm(
      buildSlackClient({ channel: { id: DM_CHANNEL_ID } }),
      CONSENT_REQUEST,
    );

    expect(result).toEqual({ success: true });
    expect(postSlackMessageMock).toHaveBeenCalledWith(
      expect.anything(),
      expect.objectContaining({ slackChannelId: DM_CHANNEL_ID }),
      { waitOutRateLimit: false },
    );
    expect(enqueueDeliveryMock).not.toHaveBeenCalled();
  });

  it('should defer the consent request to a delayed job when Slack rate limits it', async () => {
    postSlackMessageMock.mockResolvedValue({
      success: false,
      message: 'Failed to post Slack message',
      error: 'A rate limit was exceeded',
      retryAfterSeconds: 7,
    });

    const result = await sendSlackUserLinkConsentDm(
      buildSlackClient({ channel: { id: DM_CHANNEL_ID } }),
      CONSENT_REQUEST,
    );

    expect(result).toEqual({ success: true });
    expect(enqueueDeliveryMock).toHaveBeenCalledWith({
      payload: postSlackMessageMock.mock.calls[0][1],
      retryAfterSeconds: 7,
    });
  });

  it('should report any other delivery failure without deferring', async () => {
    postSlackMessageMock.mockResolvedValue({
      success: false,
      message: 'Failed to post Slack message',
      error: 'channel_not_found',
    });

    const result = await sendSlackUserLinkConsentDm(
      buildSlackClient({ channel: { id: DM_CHANNEL_ID } }),
      CONSENT_REQUEST,
    );

    expect(result).toEqual({ success: false, error: 'channel_not_found' });
    expect(enqueueDeliveryMock).not.toHaveBeenCalled();
  });

  it('should fail when Slack does not open a direct message', async () => {
    const result = await sendSlackUserLinkConsentDm(
      buildSlackClient({ channel: undefined }),
      CONSENT_REQUEST,
    );

    expect(result.success).toBe(false);
    expect(postSlackMessageMock).not.toHaveBeenCalled();
  });
});
