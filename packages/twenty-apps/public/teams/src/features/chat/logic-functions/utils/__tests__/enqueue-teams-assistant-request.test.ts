import { beforeEach, describe, expect, it, vi } from 'vitest';

import { CHAT_ENABLED_APPLICATION_VARIABLE_KEY } from 'src/features/chat/constants/chat-enabled-application-variable-key';
import { TEAMS_CHAT_DISABLED_SKIP_REASON } from 'src/features/chat/logic-functions/constants/teams-chat-disabled-skip-reason';
import { type TeamsActivitiesDispatchPayload } from 'src/features/chat/logic-functions/types/teams-activities-dispatch-payload.type';
import { enqueueTeamsAssistantRequest } from 'src/features/chat/logic-functions/utils/enqueue-teams-assistant-request';

const { featureFlags, enqueueTeamsAssistantRequestRecordMock } = vi.hoisted(
  () => ({
    featureFlags: { IS_CHAT_ASSISTANT_ENABLED: true },
    enqueueTeamsAssistantRequestRecordMock: vi.fn(),
  }),
);

vi.mock('src/constants/feature-flags', () => ({
  FEATURE_FLAGS: featureFlags,
}));

vi.mock(
  'src/features/chat/logic-functions/utils/enqueue-teams-assistant-request-record',
  () => ({
    enqueueTeamsAssistantRequestRecord: enqueueTeamsAssistantRequestRecordMock,
  }),
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
    featureFlags.IS_CHAT_ASSISTANT_ENABLED = true;
    process.env[CHAT_ENABLED_APPLICATION_VARIABLE_KEY] = 'true';
    enqueueTeamsAssistantRequestRecordMock.mockResolvedValue({
      ok: true,
      request: { id: 'request-1' },
    });
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
      skipped: TEAMS_CHAT_DISABLED_SKIP_REASON,
    });
    expect(enqueueTeamsAssistantRequestRecordMock).not.toHaveBeenCalled();
  });

  it('should skip while the chat feature is unavailable', async () => {
    featureFlags.IS_CHAT_ASSISTANT_ENABLED = false;

    expect(await enqueueTeamsAssistantRequest(PAYLOAD)).toEqual({
      ok: true,
      skipped: TEAMS_CHAT_DISABLED_SKIP_REASON,
    });
    expect(enqueueTeamsAssistantRequestRecordMock).not.toHaveBeenCalled();
  });

  it('should not record activities the parser rejects', async () => {
    expect(
      await enqueueTeamsAssistantRequest({
        ...PAYLOAD,
        activity: { ...PAYLOAD.activity, type: 'typing' },
      }),
    ).toEqual({ ok: true, skipped: 'Unhandled activity type: typing' });
    expect(enqueueTeamsAssistantRequestRecordMock).not.toHaveBeenCalled();
  });
});
