import { beforeEach, describe, expect, it, vi } from 'vitest';

import { SLACK_CHANNEL_WELCOME_THREAD_TEXT } from 'src/logic-functions/constants/slack-channel-welcome-thread-text';
import { SLACK_CHANNEL_WELCOME_TEXT } from 'src/logic-functions/constants/slack-channel-welcome-text';
import { postSlackChannelWelcome } from 'src/logic-functions/utils/post-slack-channel-welcome';

const {
  authTestMock,
  claimSlackChannelWelcomeMock,
  getSlackClientMock,
  releaseSlackChannelWelcomeMock,
  slackPostMessageHandlerMock,
} = vi.hoisted(() => ({
  authTestMock: vi.fn(),
  claimSlackChannelWelcomeMock: vi.fn(),
  getSlackClientMock: vi.fn(),
  releaseSlackChannelWelcomeMock: vi.fn(),
  slackPostMessageHandlerMock: vi.fn(),
}));

vi.mock('src/logic-functions/utils/get-slack-client', () => ({
  getSlackClient: getSlackClientMock,
}));

vi.mock('src/logic-functions/utils/claim-slack-channel-welcome', () => ({
  claimSlackChannelWelcome: claimSlackChannelWelcomeMock,
}));

vi.mock('src/logic-functions/utils/release-slack-channel-welcome', () => ({
  releaseSlackChannelWelcome: releaseSlackChannelWelcomeMock,
}));

vi.mock('src/logic-functions/handlers/slack-post-message-handler', () => ({
  slackPostMessageHandler: slackPostMessageHandlerMock,
}));

const BOT_USER_ID = 'UBOT';
const CHANNEL_ID = 'C123';
const CHANNEL_MESSAGE_TIMESTAMP = '1700000000.000100';

const buildJoinBody = (slackUserId: string = BOT_USER_ID) => ({
  type: 'event_callback',
  event_id: 'Ev123',
  team_id: 'T123',
  event: {
    type: 'member_joined_channel',
    user: slackUserId,
    channel: CHANNEL_ID,
  },
});

describe('postSlackChannelWelcome', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    authTestMock.mockResolvedValue({ user_id: BOT_USER_ID });
    getSlackClientMock.mockResolvedValue({
      success: true,
      client: { auth: { test: authTestMock } },
    });
    claimSlackChannelWelcomeMock.mockResolvedValue(true);
    slackPostMessageHandlerMock.mockResolvedValue({
      success: true,
      message: 'Message posted to Slack.',
      slackTs: CHANNEL_MESSAGE_TIMESTAMP,
    });
  });

  it('should post the welcome in the channel and the details in its thread', async () => {
    const result = await postSlackChannelWelcome(buildJoinBody());

    expect(result).toEqual({ ok: true });
    expect(slackPostMessageHandlerMock).toHaveBeenNthCalledWith(1, {
      slackChannelId: CHANNEL_ID,
      messageText: SLACK_CHANNEL_WELCOME_TEXT,
      messageFormat: 'markdown',
    });
    expect(slackPostMessageHandlerMock).toHaveBeenNthCalledWith(2, {
      slackChannelId: CHANNEL_ID,
      messageText: SLACK_CHANNEL_WELCOME_THREAD_TEXT,
      parentMessageTimestamp: CHANNEL_MESSAGE_TIMESTAMP,
      messageFormat: 'markdown',
    });
  });

  it('should skip an event that is not a channel join', async () => {
    const result = await postSlackChannelWelcome({ type: 'url_verification' });

    expect(result).toEqual({
      ok: true,
      skipped: 'Unhandled body type: url_verification',
    });
    expect(getSlackClientMock).not.toHaveBeenCalled();
  });

  it('should not welcome the channel when someone other than the bot joins', async () => {
    const result = await postSlackChannelWelcome(buildJoinBody('UALICE'));

    expect(result).toEqual({
      ok: true,
      skipped: 'Someone other than the bot joined',
    });
    expect(claimSlackChannelWelcomeMock).not.toHaveBeenCalled();
    expect(slackPostMessageHandlerMock).not.toHaveBeenCalled();
  });

  it('should not welcome a channel that was already welcomed', async () => {
    claimSlackChannelWelcomeMock.mockResolvedValue(false);

    const result = await postSlackChannelWelcome(buildJoinBody());

    expect(result).toEqual({
      ok: true,
      skipped: 'Channel was already welcomed',
    });
    expect(slackPostMessageHandlerMock).not.toHaveBeenCalled();
  });

  it('should release the claim and throw when the channel message fails', async () => {
    slackPostMessageHandlerMock.mockResolvedValue({
      success: false,
      message: 'Failed to post Slack message',
      error: 'channel_not_found',
    });

    await expect(postSlackChannelWelcome(buildJoinBody())).rejects.toThrow(
      'channel_not_found',
    );
    expect(releaseSlackChannelWelcomeMock).toHaveBeenCalledWith(CHANNEL_ID);
    expect(slackPostMessageHandlerMock).toHaveBeenCalledTimes(1);
  });

  it('should release the claim and throw when Slack returns no timestamp to thread under', async () => {
    slackPostMessageHandlerMock.mockResolvedValue({
      success: true,
      message: 'Message posted to Slack.',
    });

    await expect(postSlackChannelWelcome(buildJoinBody())).rejects.toThrow(
      /Failed to post the Slack welcome in channel/,
    );
    expect(releaseSlackChannelWelcomeMock).toHaveBeenCalledWith(CHANNEL_ID);
  });

  it('should keep the claim and throw when only the thread reply fails', async () => {
    slackPostMessageHandlerMock
      .mockResolvedValueOnce({
        success: true,
        message: 'Message posted to Slack.',
        slackTs: CHANNEL_MESSAGE_TIMESTAMP,
      })
      .mockResolvedValueOnce({
        success: false,
        message: 'Failed to post Slack message',
        error: 'msg_too_long',
      });

    await expect(postSlackChannelWelcome(buildJoinBody())).rejects.toThrow(
      'msg_too_long',
    );
    expect(releaseSlackChannelWelcomeMock).not.toHaveBeenCalled();
  });

  it('should throw when Slack is not connected', async () => {
    getSlackClientMock.mockResolvedValue({
      success: false,
      error: 'Slack is not connected.',
    });

    await expect(postSlackChannelWelcome(buildJoinBody())).rejects.toThrow(
      'Slack is not connected.',
    );
    expect(claimSlackChannelWelcomeMock).not.toHaveBeenCalled();
  });
});
