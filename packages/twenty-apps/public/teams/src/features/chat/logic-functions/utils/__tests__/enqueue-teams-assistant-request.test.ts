import { beforeEach, describe, expect, it, vi } from 'vitest';

import { CHAT_ENABLED_APPLICATION_VARIABLE_KEY } from 'src/features/chat/constants/chat-enabled-application-variable-key';
import { TEAMS_ASSISTANT_CHAT_OFF_TEXT } from 'src/features/chat/logic-functions/constants/teams-assistant-chat-off-text';
import { TEAMS_ASSISTANT_HELP_TEXT } from 'src/features/chat/logic-functions/constants/teams-assistant-help-text';
import { TEAMS_ASSISTANT_NOTICE_TTL_MS } from 'src/features/chat/logic-functions/constants/teams-assistant-notice-ttl-ms';
import { TEAMS_ASSISTANT_WELCOME_TTL_MS } from 'src/features/chat/logic-functions/constants/teams-assistant-welcome-ttl-ms';
import { type TeamsActivitiesDispatchPayload } from 'src/features/chat/logic-functions/types/teams-activities-dispatch-payload.type';
import { enqueueTeamsAssistantRequest } from 'src/features/chat/logic-functions/utils/enqueue-teams-assistant-request';

const {
  releaseFlags,
  enqueueTeamsAssistantRequestRecordMock,
  replyWithHelpMock,
  sendNoticeMock,
} = vi.hoisted(() => ({
  sendNoticeMock: vi.fn(),
  releaseFlags: { IS_CHAT_ASSISTANT_RELEASED: true },
  enqueueTeamsAssistantRequestRecordMock: vi.fn(),
  replyWithHelpMock: vi.fn(),
}));

vi.mock('src/constants/release-flags', () => ({
  RELEASE_FLAGS: releaseFlags,
}));

vi.mock(
  'src/features/chat/logic-functions/utils/enqueue-teams-assistant-request-record',
  () => ({
    enqueueTeamsAssistantRequestRecord: enqueueTeamsAssistantRequestRecordMock,
  }),
);

vi.mock(
  'src/features/chat/logic-functions/utils/reply-with-teams-assistant-help',
  () => ({ replyWithTeamsAssistantHelp: replyWithHelpMock }),
);

vi.mock(
  'src/features/chat/logic-functions/utils/send-teams-assistant-notice',
  () => ({ sendTeamsAssistantNotice: sendNoticeMock }),
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

describe('enqueueTeamsAssistantRequest', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    releaseFlags.IS_CHAT_ASSISTANT_RELEASED = true;
    process.env[CHAT_ENABLED_APPLICATION_VARIABLE_KEY] = 'true';
    enqueueTeamsAssistantRequestRecordMock.mockResolvedValue({
      ok: true,
      request: { id: 'request-1' },
    });
    replyWithHelpMock.mockResolvedValue({ ok: true });
    sendNoticeMock.mockResolvedValue(true);
  });

  it('should answer a help request with the help text instead of running the assistant', async () => {
    const result = await enqueueTeamsAssistantRequest({
      ...PAYLOAD,
      activity: { ...PAYLOAD.activity, text: 'help' },
    });

    expect(result).toEqual({ ok: true });
    expect(replyWithHelpMock).toHaveBeenCalledExactlyOnceWith(
      expect.objectContaining({
        teamsActivityId: '1700000000000',
        teamsConversationId: 'a:personal-conversation',
      }),
    );
    expect(enqueueTeamsAssistantRequestRecordMock).not.toHaveBeenCalled();
  });

  it('should welcome the conversation when the bot is installed', async () => {
    const installPayload = {
      ...PAYLOAD,
      activity: {
        ...PAYLOAD.activity,
        type: 'installationUpdate',
        action: 'add',
        text: undefined,
      },
    };

    expect(await enqueueTeamsAssistantRequest(installPayload)).toEqual({
      ok: true,
    });
    expect(sendNoticeMock).toHaveBeenCalledExactlyOnceWith({
      payload: installPayload,
      kind: 'welcome',
      text: TEAMS_ASSISTANT_HELP_TEXT,
      ttlMs: TEAMS_ASSISTANT_WELCOME_TTL_MS,
    });
    expect(enqueueTeamsAssistantRequestRecordMock).not.toHaveBeenCalled();
  });

  it('should answer a bare mention with a hint instead of recording it', async () => {
    replyWithHelpMock.mockResolvedValue({ ok: true });

    const result = await enqueueTeamsAssistantRequest({
      ...PAYLOAD,
      activity: {
        ...PAYLOAD.activity,
        text: '<at>Twenty</at>',
        entities: [
          {
            type: 'mention',
            text: '<at>Twenty</at>',
            mentioned: { id: '28:bot-app-id' },
          },
        ],
        conversation: {
          id: '19:channel@thread.tacv2;messageid=1699999999999',
          conversationType: 'channel',
        },
      },
    });

    expect(result).toEqual({ ok: true });
    expect(replyWithHelpMock).toHaveBeenCalledExactlyOnceWith({
      teamsActivityId: '1700000000000',
      teamsConversationId: '19:channel@thread.tacv2;messageid=1699999999999',
      teamsServiceUrl: PAYLOAD.serviceUrl,
    });
    expect(enqueueTeamsAssistantRequestRecordMock).not.toHaveBeenCalled();
  });

  it('should record a message when chat is enabled', async () => {
    const result = await enqueueTeamsAssistantRequest(PAYLOAD);

    expect(enqueueTeamsAssistantRequestRecordMock).toHaveBeenCalledWith(
      expect.objectContaining({
        teamsActivityId: '1700000000000',
        teamsTenantId: 'tenant-id',
        requestText: 'how many open deals does Acme have?',
      }),
    );
    expect(result).toEqual({ ok: true, request: { id: 'request-1' } });
  });

  it('should tell the sender chat is off when the workspace turned it off', async () => {
    process.env[CHAT_ENABLED_APPLICATION_VARIABLE_KEY] = 'false';

    expect(await enqueueTeamsAssistantRequest(PAYLOAD)).toEqual({
      ok: true,
      skipped: 'Chat is disabled',
    });
    expect(sendNoticeMock).toHaveBeenCalledExactlyOnceWith({
      payload: PAYLOAD,
      kind: 'chat-off',
      text: TEAMS_ASSISTANT_CHAT_OFF_TEXT,
      ttlMs: TEAMS_ASSISTANT_NOTICE_TTL_MS,
    });
    expect(enqueueTeamsAssistantRequestRecordMock).not.toHaveBeenCalled();
  });

  it('should skip while the chat feature is unavailable', async () => {
    releaseFlags.IS_CHAT_ASSISTANT_RELEASED = false;

    expect(await enqueueTeamsAssistantRequest(PAYLOAD)).toEqual({
      ok: true,
      skipped: 'Chat is disabled',
    });
    expect(sendNoticeMock).not.toHaveBeenCalled();
    expect(enqueueTeamsAssistantRequestRecordMock).not.toHaveBeenCalled();
  });
});
