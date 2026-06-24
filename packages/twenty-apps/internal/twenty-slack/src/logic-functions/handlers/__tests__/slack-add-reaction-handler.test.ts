import { beforeEach, describe, expect, it, vi } from 'vitest';

import { slackAddReactionHandler } from 'src/logic-functions/handlers/slack-add-reaction-handler';

const { getSlackClientMock, addReactionMock } = vi.hoisted(() => ({
  getSlackClientMock: vi.fn(),
  addReactionMock: vi.fn(),
}));

vi.mock('src/logic-functions/utils/get-slack-client', () => ({
  getSlackClient: getSlackClientMock,
}));

const CHANNEL_ID = 'C0123456789';
const MESSAGE_TS = '1700000000.000100';

describe('slackAddReactionHandler', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    getSlackClientMock.mockResolvedValue({
      success: true,
      client: { reactions: { add: addReactionMock } },
    });
  });

  it('should return a failure result and skip reacting when Slack is not connected', async () => {
    getSlackClientMock.mockResolvedValue({
      success: false,
      error: 'Slack is not connected.',
    });

    const result = await slackAddReactionHandler({
      slackChannelId: CHANNEL_ID,
      messageTimestamp: MESSAGE_TS,
      emojiName: 'thumbsup',
    });

    expect(result.success).toBe(false);
    expect(addReactionMock).not.toHaveBeenCalled();
  });

  it('should add the reaction with a colon-stripped, trimmed emoji name', async () => {
    addReactionMock.mockResolvedValue({ ok: true });

    const result = await slackAddReactionHandler({
      slackChannelId: CHANNEL_ID,
      messageTimestamp: MESSAGE_TS,
      emojiName: '  white_check_mark  ',
    });

    expect(addReactionMock).toHaveBeenCalledWith({
      channel: CHANNEL_ID,
      timestamp: MESSAGE_TS,
      name: 'white_check_mark',
    });
    expect(result).toEqual({
      success: true,
      message: 'Reaction "white_check_mark" added to the message.',
      slackTs: MESSAGE_TS,
      channel: CHANNEL_ID,
    });
  });

  it('should return a failure result when the Slack API throws', async () => {
    addReactionMock.mockRejectedValue(new Error('already_reacted'));

    const result = await slackAddReactionHandler({
      slackChannelId: CHANNEL_ID,
      messageTimestamp: MESSAGE_TS,
      emojiName: 'eyes',
    });

    expect(result).toEqual({
      success: false,
      message: 'Failed to add Slack reaction',
      error: 'already_reacted',
    });
  });
});
