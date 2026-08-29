import { beforeEach, describe, expect, it, vi } from 'vitest';

import { type SlackEventsRequestBody } from 'src/logic-functions/types/slack-events-request-body.type';
import { postSlackChannelWelcome } from 'src/logic-functions/utils/post-slack-channel-welcome';

const {
  claimSlackChannelWelcomeMock,
  getSlackClientMock,
  postSlackMessageMock,
  releaseSlackChannelWelcomeMock,
  resolveSlackBotUserIdOrThrowMock,
} = vi.hoisted(() => ({
  claimSlackChannelWelcomeMock: vi.fn(),
  getSlackClientMock: vi.fn(),
  postSlackMessageMock: vi.fn(),
  releaseSlackChannelWelcomeMock: vi.fn(),
  resolveSlackBotUserIdOrThrowMock: vi.fn(),
}));

vi.mock('src/logic-functions/utils/claim-slack-channel-welcome', () => ({
  claimSlackChannelWelcome: claimSlackChannelWelcomeMock,
}));

vi.mock('src/logic-functions/utils/get-slack-client', () => ({
  getSlackClient: getSlackClientMock,
}));

vi.mock('src/logic-functions/utils/post-slack-message', () => ({
  postSlackMessage: postSlackMessageMock,
}));

vi.mock('src/logic-functions/utils/release-slack-channel-welcome', () => ({
  releaseSlackChannelWelcome: releaseSlackChannelWelcomeMock,
}));

vi.mock('src/logic-functions/utils/resolve-slack-bot-user-id-or-throw', () => ({
  resolveSlackBotUserIdOrThrow: resolveSlackBotUserIdOrThrowMock,
}));

const BOT_USER_ID = 'UBOT';
const CHANNEL_ID = 'C123';

const buildJoinEvent = (slackUserId: string): SlackEventsRequestBody => ({
  type: 'event_callback',
  team_id: 'T123',
  event: {
    type: 'member_joined_channel',
    channel: CHANNEL_ID,
    user: slackUserId,
  },
});

describe('postSlackChannelWelcome', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    resolveSlackBotUserIdOrThrowMock.mockResolvedValue(BOT_USER_ID);
    claimSlackChannelWelcomeMock.mockResolvedValue(true);
    releaseSlackChannelWelcomeMock.mockResolvedValue(undefined);
    getSlackClientMock.mockResolvedValue({ success: true, client: {} });
    postSlackMessageMock.mockResolvedValue({ success: true, slackTs: '1.1' });
  });

  it('should skip without touching the Slack connection when someone else joined', async () => {
    const result = await postSlackChannelWelcome(buildJoinEvent('UHUMAN'));

    expect(result).toEqual({
      ok: true,
      skipped: 'Someone other than the bot joined',
    });
    expect(getSlackClientMock).not.toHaveBeenCalled();
    expect(claimSlackChannelWelcomeMock).not.toHaveBeenCalled();
  });

  it('should skip when the channel was already welcomed', async () => {
    claimSlackChannelWelcomeMock.mockResolvedValue(false);

    const result = await postSlackChannelWelcome(buildJoinEvent(BOT_USER_ID));

    expect(result).toEqual({
      ok: true,
      skipped: 'Channel was already welcomed',
    });
    expect(getSlackClientMock).not.toHaveBeenCalled();
  });

  it('should post the channel message and its thread reply on the bot join', async () => {
    const result = await postSlackChannelWelcome(buildJoinEvent(BOT_USER_ID));

    expect(result).toEqual({ ok: true });
    expect(postSlackMessageMock).toHaveBeenCalledTimes(2);
    expect(postSlackMessageMock.mock.calls[1][1]).toMatchObject({
      slackChannelId: CHANNEL_ID,
      parentMessageTimestamp: '1.1',
    });
    expect(releaseSlackChannelWelcomeMock).not.toHaveBeenCalled();
  });

  it('should release the claim when the Slack client cannot be built', async () => {
    getSlackClientMock.mockResolvedValue({
      success: false,
      error: 'Slack is not connected.',
    });

    await expect(
      postSlackChannelWelcome(buildJoinEvent(BOT_USER_ID)),
    ).rejects.toThrow('Slack is not connected.');
    expect(releaseSlackChannelWelcomeMock).toHaveBeenCalledWith(CHANNEL_ID);
  });

  it('should release the claim when the channel message fails to post', async () => {
    postSlackMessageMock.mockResolvedValue({
      success: false,
      error: 'channel_not_found',
    });

    await expect(
      postSlackChannelWelcome(buildJoinEvent(BOT_USER_ID)),
    ).rejects.toThrow('channel_not_found');
    expect(releaseSlackChannelWelcomeMock).toHaveBeenCalledWith(CHANNEL_ID);
  });

  it('should keep the claim when only the thread reply fails, so a retry cannot repost the channel message', async () => {
    postSlackMessageMock
      .mockResolvedValueOnce({ success: true, slackTs: '1.1' })
      .mockResolvedValueOnce({ success: false, error: 'thread_not_found' });

    await expect(
      postSlackChannelWelcome(buildJoinEvent(BOT_USER_ID)),
    ).rejects.toThrow('thread_not_found');
    expect(releaseSlackChannelWelcomeMock).not.toHaveBeenCalled();
  });
});
