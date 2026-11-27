import { beforeEach, describe, expect, it, vi } from 'vitest';

import { TEAMS_ASSISTANT_FAILURE_TEXT } from 'src/features/chat/logic-functions/constants/teams-assistant-failure-text';
import { teamsActivitiesEnqueueJobFailureHandler } from 'src/features/chat/logic-functions/handlers/teams-activities-enqueue-job-failure-handler';
import { type TeamsActivitiesDispatchPayload } from 'src/features/chat/logic-functions/types/teams-activities-dispatch-payload.type';

const { findRequestMock, updateRequestMock, sendReplyOnceMock } = vi.hoisted(
  () => ({
    findRequestMock: vi.fn(),
    updateRequestMock: vi.fn(),
    sendReplyOnceMock: vi.fn(),
  }),
);

vi.mock(
  'src/features/chat/logic-functions/data/find-teams-assistant-request-by-teams-activity',
  () => ({ findTeamsAssistantRequestByTeamsActivity: findRequestMock }),
);

vi.mock(
  'src/features/chat/logic-functions/data/update-teams-assistant-request',
  () => ({ updateTeamsAssistantRequest: updateRequestMock }),
);

vi.mock(
  'src/features/chat/logic-functions/utils/send-teams-reply-once',
  () => ({ sendTeamsReplyOnce: sendReplyOnceMock }),
);

vi.mock('twenty-client-sdk/core', () => ({
  CoreApiClient: class {},
}));

const SERVICE_URL = 'https://smba.trafficmanager.net/amer/';
const CONVERSATION_ID = 'a:personal-conversation';
const ACTIVITY_ID = '1700000000000';
const REQUEST_ID = '7b1a0f2e-1c2d-4a3b-9e8f-0a1b2c3d4e5f';

const MESSAGE_PAYLOAD: TeamsActivitiesDispatchPayload = {
  activity: {
    type: 'message',
    id: ACTIVITY_ID,
    text: 'how many open deals does Acme have?',
    from: { id: '29:user-id', aadObjectId: 'aad-user-id' },
    recipient: { id: '28:bot-app-id' },
    conversation: { id: CONVERSATION_ID, conversationType: 'personal' },
  },
  serviceUrl: SERVICE_URL,
  tenantId: 'tenant-id',
};

const TIMEOUT_FAILURE = {
  payload: MESSAGE_PAYLOAD,
  error: { type: 'TimeoutError', message: 'Task timed out after 240 seconds' },
  job: { id: 'job-1', attemptsMade: 1 },
};

describe('teamsActivitiesEnqueueJobFailureHandler', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    sendReplyOnceMock.mockResolvedValue(true);
  });

  it('should reply with the failure text and fail an unfinished request', async () => {
    findRequestMock.mockResolvedValue({ id: REQUEST_ID, status: 'PROCESSING' });

    await teamsActivitiesEnqueueJobFailureHandler(TIMEOUT_FAILURE);

    expect(findRequestMock).toHaveBeenCalledWith(
      expect.objectContaining({
        teamsConversationId: CONVERSATION_ID,
        teamsActivityId: ACTIVITY_ID,
      }),
    );
    expect(sendReplyOnceMock).toHaveBeenCalledWith(
      expect.objectContaining({
        kvKey: `teams-job-failure-reply:${REQUEST_ID}`,
        serviceUrl: SERVICE_URL,
        conversationId: CONVERSATION_ID,
        text: TEAMS_ASSISTANT_FAILURE_TEXT,
      }),
    );
    expect(updateRequestMock).toHaveBeenCalledWith(
      expect.objectContaining({
        id: REQUEST_ID,
        status: 'FAILED',
        errorMessage: 'TimeoutError: Task timed out after 240 seconds',
      }),
    );
  });

  it('should still fail the request when a previous try already replied', async () => {
    findRequestMock.mockResolvedValue({ id: REQUEST_ID, status: 'PROCESSING' });
    sendReplyOnceMock.mockResolvedValue(false);

    await teamsActivitiesEnqueueJobFailureHandler(TIMEOUT_FAILURE);

    expect(updateRequestMock).toHaveBeenCalledWith(
      expect.objectContaining({ id: REQUEST_ID, status: 'FAILED' }),
    );
  });

  it.each(['DONE', 'FAILED'])(
    'should leave a %s request untouched',
    async (status) => {
      findRequestMock.mockResolvedValue({ id: REQUEST_ID, status });

      const result =
        await teamsActivitiesEnqueueJobFailureHandler(TIMEOUT_FAILURE);

      expect(result).toEqual({
        skipped: true,
        reason: 'Request is already finished',
      });
      expect(sendReplyOnceMock).not.toHaveBeenCalled();
      expect(updateRequestMock).not.toHaveBeenCalled();
    },
  );

  it('should skip when the run never recorded a request', async () => {
    findRequestMock.mockResolvedValue(undefined);

    await teamsActivitiesEnqueueJobFailureHandler(TIMEOUT_FAILURE);

    expect(sendReplyOnceMock).not.toHaveBeenCalled();
  });

  it('should skip an activity that is not an assistant request', async () => {
    const result = await teamsActivitiesEnqueueJobFailureHandler({
      ...TIMEOUT_FAILURE,
      payload: {
        ...MESSAGE_PAYLOAD,
        activity: { ...MESSAGE_PAYLOAD.activity, type: 'conversationUpdate' },
      },
    });

    expect(result).toEqual({
      skipped: true,
      reason: 'Unhandled activity type: conversationUpdate',
    });
    expect(findRequestMock).not.toHaveBeenCalled();
  });
});
