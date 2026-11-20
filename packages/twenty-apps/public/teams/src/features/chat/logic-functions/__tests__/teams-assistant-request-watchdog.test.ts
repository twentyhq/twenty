import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { TEAMS_ASSISTANT_INTERRUPTED_ERROR } from 'src/features/chat/logic-functions/constants/teams-assistant-interrupted-error';
import { TEAMS_ASSISTANT_INTERRUPTED_FAILURE_TEXT } from 'src/features/chat/logic-functions/constants/teams-assistant-interrupted-failure-text';
import { TEAMS_ASSISTANT_REQUEST_TIMEOUT_SECONDS } from 'src/features/chat/logic-functions/constants/teams-assistant-request-timeout-seconds';
import { TEAMS_ASSISTANT_REQUEST_WATCHDOG_MAX_ATTEMPTS } from 'src/features/chat/logic-functions/constants/teams-assistant-request-watchdog-max-attempts';
import { teamsAssistantRequestWatchdogHandler } from 'src/features/chat/logic-functions/teams-assistant-request-watchdog';

const {
  findRequestMock,
  failStaleRequestMock,
  enqueueWatchdogMock,
  sendTeamsActivityMock,
} = vi.hoisted(() => ({
  findRequestMock: vi.fn(),
  failStaleRequestMock: vi.fn(),
  enqueueWatchdogMock: vi.fn(),
  sendTeamsActivityMock: vi.fn(),
}));

vi.mock(
  'src/features/chat/logic-functions/data/find-teams-assistant-request-by-id',
  () => ({
    findTeamsAssistantRequestById: findRequestMock,
  }),
);

vi.mock(
  'src/features/chat/logic-functions/data/fail-stale-teams-assistant-request',
  () => ({
    failStaleTeamsAssistantRequest: failStaleRequestMock,
  }),
);

vi.mock(
  'src/features/chat/logic-functions/utils/enqueue-teams-assistant-request-watchdog',
  () => ({
    enqueueTeamsAssistantRequestWatchdog: enqueueWatchdogMock,
  }),
);

vi.mock('src/features/chat/logic-functions/utils/send-teams-activity', () => ({
  sendTeamsActivity: sendTeamsActivityMock,
}));

vi.mock(
  'src/features/chat/logic-functions/utils/get-teams-connector-access-token-or-throw',
  () => ({
    getTeamsConnectorAccessTokenOrThrow: async () => 'connector-token',
  }),
);

vi.mock('twenty-client-sdk/core', () => ({
  CoreApiClient: class {},
}));

const NOW = new Date('2026-09-09T12:00:00.000Z');
const REQUEST_ID = '7b1a0f2e-1c2d-4a3b-9e8f-0a1b2c3d4e5f';
const SERVICE_URL = 'https://smba.trafficmanager.net/amer/';
const CONVERSATION_ID = 'a:personal-conversation';

const secondsAgo = (seconds: number): string =>
  new Date(NOW.getTime() - seconds * 1000).toISOString();

const STALE_UPDATED_AT = secondsAgo(
  TEAMS_ASSISTANT_REQUEST_TIMEOUT_SECONDS + 1,
);
const FRESH_UPDATED_AT = secondsAgo(
  TEAMS_ASSISTANT_REQUEST_TIMEOUT_SECONDS - 1,
);

const buildRequest = (overrides: { status: string; updatedAt?: string }) => ({
  id: REQUEST_ID,
  teamsServiceUrl: SERVICE_URL,
  teamsConversationId: CONVERSATION_ID,
  updatedAt: STALE_UPDATED_AT,
  ...overrides,
});

const runWatchdog = (attempt?: number) =>
  teamsAssistantRequestWatchdogHandler({
    teamsAssistantRequestId: REQUEST_ID,
    attempt,
  });

describe('teamsAssistantRequestWatchdogHandler', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.useFakeTimers();
    vi.setSystemTime(NOW);
    sendTeamsActivityMock.mockResolvedValue({ id: 'activity-1' });
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it.each(['DONE', 'FAILED'])(
    'should leave a %s request alone',
    async (status) => {
      findRequestMock.mockResolvedValue(buildRequest({ status }));

      const result = await runWatchdog();

      expect(result).toMatchObject({ failed: false, rescheduled: false });
      expect(failStaleRequestMock).not.toHaveBeenCalled();
      expect(sendTeamsActivityMock).not.toHaveBeenCalled();
      expect(enqueueWatchdogMock).not.toHaveBeenCalled();
    },
  );

  it('should do nothing when the request no longer exists', async () => {
    findRequestMock.mockResolvedValue(undefined);

    const result = await runWatchdog();

    expect(result).toMatchObject({ failed: false, rescheduled: false });
    expect(failStaleRequestMock).not.toHaveBeenCalled();
    expect(sendTeamsActivityMock).not.toHaveBeenCalled();
  });

  it.each(['PROCESSING', 'PENDING'])(
    'should fail a stale %s request and tell the user once to ask again',
    async (status) => {
      findRequestMock.mockResolvedValue(buildRequest({ status }));
      failStaleRequestMock.mockResolvedValue(true);

      const result = await runWatchdog();

      expect(result).toEqual({ failed: true, attempt: 1, replied: true });
      expect(failStaleRequestMock).toHaveBeenCalledExactlyOnceWith(
        expect.objectContaining({
          id: REQUEST_ID,
          errorMessage: TEAMS_ASSISTANT_INTERRUPTED_ERROR,
        }),
      );
      expect(sendTeamsActivityMock).toHaveBeenCalledExactlyOnceWith({
        serviceUrl: SERVICE_URL,
        conversationId: CONVERSATION_ID,
        accessToken: 'connector-token',
        activity: {
          type: 'message',
          text: TEAMS_ASSISTANT_INTERRUPTED_FAILURE_TEXT,
        },
      });
      expect(enqueueWatchdogMock).not.toHaveBeenCalled();
    },
  );

  it('should send nothing when another execution finished the request first', async () => {
    findRequestMock.mockResolvedValue(buildRequest({ status: 'PROCESSING' }));
    failStaleRequestMock.mockResolvedValue(false);

    const result = await runWatchdog();

    expect(result).toMatchObject({ failed: false, rescheduled: false });
    expect(sendTeamsActivityMock).not.toHaveBeenCalled();
    expect(enqueueWatchdogMock).not.toHaveBeenCalled();
  });

  it('should check again later when the run is still within its lease', async () => {
    findRequestMock.mockResolvedValue(
      buildRequest({ status: 'PROCESSING', updatedAt: FRESH_UPDATED_AT }),
    );

    const result = await runWatchdog();

    expect(result).toEqual({ failed: false, attempt: 1, rescheduled: true });
    expect(enqueueWatchdogMock).toHaveBeenCalledExactlyOnceWith({
      teamsAssistantRequestId: REQUEST_ID,
      attempt: 1,
    });
    expect(failStaleRequestMock).not.toHaveBeenCalled();
    expect(sendTeamsActivityMock).not.toHaveBeenCalled();
  });

  it('should give up instead of rescheduling once the attempt cap is reached', async () => {
    findRequestMock.mockResolvedValue(
      buildRequest({ status: 'PROCESSING', updatedAt: FRESH_UPDATED_AT }),
    );

    const result = await runWatchdog(
      TEAMS_ASSISTANT_REQUEST_WATCHDOG_MAX_ATTEMPTS,
    );

    expect(result).toMatchObject({ failed: false, rescheduled: false });
    expect(enqueueWatchdogMock).not.toHaveBeenCalled();
    expect(failStaleRequestMock).not.toHaveBeenCalled();
    expect(sendTeamsActivityMock).not.toHaveBeenCalled();
  });

  it('should keep the request failed when the reply cannot be posted', async () => {
    const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});

    findRequestMock.mockResolvedValue(buildRequest({ status: 'PROCESSING' }));
    failStaleRequestMock.mockResolvedValue(true);
    sendTeamsActivityMock.mockRejectedValue(new Error('connector down'));

    const result = await runWatchdog();

    expect(result).toEqual({ failed: true, attempt: 1, replied: false });

    warnSpy.mockRestore();
  });
});
