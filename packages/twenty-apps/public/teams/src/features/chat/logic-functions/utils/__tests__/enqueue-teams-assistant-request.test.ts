import { beforeEach, describe, expect, it, vi } from 'vitest';

import { CHAT_ENABLED_APPLICATION_VARIABLE_KEY } from 'src/features/chat/constants/chat-enabled-application-variable-key';
import { type TeamsActivitiesDispatchPayload } from 'src/features/chat/logic-functions/types/teams-activities-dispatch-payload.type';
import { enqueueTeamsAssistantRequest } from 'src/features/chat/logic-functions/utils/enqueue-teams-assistant-request';

const {
  releaseFlags,
  enqueueTeamsAssistantRequestRecordMock,
  replyToEmptyRequestMock,
} = vi.hoisted(() => ({
  releaseFlags: { IS_CHAT_ASSISTANT_RELEASED: true },
  enqueueTeamsAssistantRequestRecordMock: vi.fn(),
  replyToEmptyRequestMock: vi.fn(),
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
  'src/features/chat/logic-functions/utils/reply-to-empty-teams-assistant-request',
  () => ({ replyToEmptyTeamsAssistantRequest: replyToEmptyRequestMock }),
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
  });

  it('should answer a bare mention with a hint instead of recording it', async () => {
    replyToEmptyRequestMock.mockResolvedValue({ ok: true });

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
    expect(replyToEmptyRequestMock).toHaveBeenCalledExactlyOnceWith({
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

  it('should skip when the workspace turned chat off', async () => {
    process.env[CHAT_ENABLED_APPLICATION_VARIABLE_KEY] = 'false';

    expect(await enqueueTeamsAssistantRequest(PAYLOAD)).toEqual({
      ok: true,
      skipped: 'Chat is disabled',
    });
    expect(enqueueTeamsAssistantRequestRecordMock).not.toHaveBeenCalled();
  });

  it('should skip while the chat feature is unavailable', async () => {
    releaseFlags.IS_CHAT_ASSISTANT_RELEASED = false;

    expect(await enqueueTeamsAssistantRequest(PAYLOAD)).toEqual({
      ok: true,
      skipped: 'Chat is disabled',
    });
    expect(enqueueTeamsAssistantRequestRecordMock).not.toHaveBeenCalled();
  });
});
