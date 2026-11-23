import { beforeEach, describe, expect, it, vi } from 'vitest';

import { type TeamsActivitiesDispatchPayload } from 'src/features/chat/logic-functions/types/teams-activities-dispatch-payload.type';
import { sendTeamsAssistantNotice } from 'src/features/chat/logic-functions/utils/send-teams-assistant-notice';

const { sendReplyOnceMock, releaseFlags } = vi.hoisted(() => ({
  sendReplyOnceMock: vi.fn(),
  releaseFlags: { IS_CHAT_ASSISTANT_RELEASED: true },
}));

vi.mock('src/constants/release-flags', () => ({
  RELEASE_FLAGS: releaseFlags,
}));

vi.mock(
  'src/features/chat/logic-functions/utils/send-teams-reply-once',
  () => ({ sendTeamsReplyOnce: sendReplyOnceMock }),
);

const PAYLOAD: TeamsActivitiesDispatchPayload = {
  activity: {
    type: 'message',
    id: '1700000000000',
    text: 'how many open deals does Acme have?',
    from: { id: '29:user-id' },
    recipient: { id: '28:bot-app-id' },
    conversation: {
      id: 'a:personal-conversation',
      conversationType: 'personal',
    },
  },
  serviceUrl: 'https://smba.trafficmanager.net/amer/',
  tenantId: 'tenant-id',
};

const sendNotice = (payload: TeamsActivitiesDispatchPayload) =>
  sendTeamsAssistantNotice({
    payload,
    kind: 'not-connected',
    text: 'Not connected',
    ttlMs: 60_000,
  });

describe('sendTeamsAssistantNotice', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    sendReplyOnceMock.mockResolvedValue(true);
    releaseFlags.IS_CHAT_ASSISTANT_RELEASED = true;
  });

  it('should stay quiet while chat is unreleased', async () => {
    releaseFlags.IS_CHAT_ASSISTANT_RELEASED = false;

    await expect(sendNotice(PAYLOAD)).resolves.toBe(false);
    expect(sendReplyOnceMock).not.toHaveBeenCalled();
  });

  it('should post the notice once per conversation and kind', async () => {
    await expect(sendNotice(PAYLOAD)).resolves.toBe(true);

    expect(sendReplyOnceMock).toHaveBeenCalledExactlyOnceWith({
      kvKey: 'teams-notice:not-connected:a:personal-conversation',
      ttlMs: 60_000,
      serviceUrl: PAYLOAD.serviceUrl,
      conversationId: 'a:personal-conversation',
      text: 'Not connected',
    });
  });

  it('should post for a bot install, which carries no message', async () => {
    await expect(
      sendNotice({
        ...PAYLOAD,
        activity: {
          ...PAYLOAD.activity,
          type: 'installationUpdate',
          action: 'add',
          text: undefined,
        },
      }),
    ).resolves.toBe(true);
  });

  it('should stay quiet for a channel message that does not mention the bot', async () => {
    await expect(
      sendNotice({
        ...PAYLOAD,
        activity: {
          ...PAYLOAD.activity,
          conversation: {
            id: '19:channel@thread.tacv2',
            conversationType: 'channel',
          },
        },
      }),
    ).resolves.toBe(false);

    expect(sendReplyOnceMock).not.toHaveBeenCalled();
  });

  it('should not fail the activity when the notice cannot be posted', async () => {
    const warnSpy = vi
      .spyOn(console, 'warn')
      .mockImplementation(() => undefined);
    sendReplyOnceMock.mockRejectedValue(new Error('Bot Connector POST failed'));

    await expect(sendNotice(PAYLOAD)).resolves.toBe(false);
    expect(warnSpy).toHaveBeenCalledTimes(1);

    warnSpy.mockRestore();
  });
});
