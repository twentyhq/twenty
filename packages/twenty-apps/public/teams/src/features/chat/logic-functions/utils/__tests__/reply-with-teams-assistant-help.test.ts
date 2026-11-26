import { beforeEach, describe, expect, it, vi } from 'vitest';

import { TEAMS_ASSISTANT_HELP_TEXT } from 'src/features/chat/logic-functions/constants/teams-assistant-help-text';
import { TEAMS_ASSISTANT_SUGGESTED_PROMPTS } from 'src/features/chat/logic-functions/constants/teams-assistant-suggested-prompts';
import { replyWithTeamsAssistantHelp } from 'src/features/chat/logic-functions/utils/reply-with-teams-assistant-help';

const { kvMock, sendActivityMock } = vi.hoisted(() => ({
  kvMock: { get: vi.fn(), set: vi.fn(), delete: vi.fn() },
  sendActivityMock: vi.fn(),
}));

vi.mock('twenty-sdk/logic-function', () => ({ kv: kvMock }));

vi.mock(
  'src/features/chat/logic-functions/utils/get-teams-connector-access-token-or-throw',
  () => ({
    getTeamsConnectorAccessTokenOrThrow: vi.fn().mockResolvedValue('token'),
  }),
);

vi.mock('src/features/chat/logic-functions/utils/send-teams-activity', () => ({
  sendTeamsActivity: sendActivityMock,
}));

const EMPTY_REQUEST = {
  teamsActivityId: '1700000000000',
  teamsConversationId: '19:channel@thread.tacv2;messageid=1699999999999',
  teamsConversationType: 'channel',
  teamsServiceUrl: 'https://smba.trafficmanager.net/amer/',
};

const CLAIM_KEY =
  'teams-help-reply:19:channel@thread.tacv2;messageid=1699999999999:1700000000000';

describe('replyWithTeamsAssistantHelp', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    kvMock.get.mockResolvedValue(null);
    kvMock.set.mockResolvedValue(undefined);
    kvMock.delete.mockResolvedValue(true);
    sendActivityMock.mockResolvedValue({ id: 'activity-1' });
  });

  it('should post the hint once in the conversation', async () => {
    await expect(replyWithTeamsAssistantHelp(EMPTY_REQUEST)).resolves.toEqual({
      ok: true,
    });

    expect(kvMock.set).toHaveBeenCalledExactlyOnceWith(CLAIM_KEY, {
      expiresAt: expect.any(Number),
    });
    expect(sendActivityMock).toHaveBeenCalledExactlyOnceWith({
      serviceUrl: EMPTY_REQUEST.teamsServiceUrl,
      conversationId: EMPTY_REQUEST.teamsConversationId,
      accessToken: 'token',
      activity: {
        type: 'message',
        textFormat: 'extendedmarkdown',
        text: TEAMS_ASSISTANT_HELP_TEXT,
      },
    });
  });

  it('should offer the example prompts as suggested actions in a personal chat', async () => {
    await replyWithTeamsAssistantHelp({
      ...EMPTY_REQUEST,
      teamsConversationId: 'a:personal-conversation',
      teamsConversationType: 'personal',
    });

    const { activity } = sendActivityMock.mock.calls[0][0];

    expect(activity.text).toBe(TEAMS_ASSISTANT_HELP_TEXT);
    expect(activity.textFormat).toBe('extendedmarkdown');
    expect(activity.attachments).toBeUndefined();
    expect(activity.suggestedActions.actions).toEqual(
      TEAMS_ASSISTANT_SUGGESTED_PROMPTS.map((prompt) => ({
        type: 'imBack',
        title: prompt,
        value: prompt,
      })),
    );
  });

  it('should not post the hint again for an activity Teams redelivered', async () => {
    kvMock.get.mockResolvedValue({ expiresAt: Date.now() + 60_000 });

    await expect(
      replyWithTeamsAssistantHelp(EMPTY_REQUEST),
    ).resolves.toMatchObject({
      skipped: 'Help was already sent for this activity',
    });

    expect(sendActivityMock).not.toHaveBeenCalled();
  });

  it('should free the claim when the hint cannot be sent', async () => {
    sendActivityMock.mockRejectedValue(new Error('Bot Connector POST failed'));

    await expect(replyWithTeamsAssistantHelp(EMPTY_REQUEST)).rejects.toThrow(
      'Bot Connector POST failed',
    );

    expect(kvMock.delete).toHaveBeenCalledExactlyOnceWith(CLAIM_KEY);
  });
});
