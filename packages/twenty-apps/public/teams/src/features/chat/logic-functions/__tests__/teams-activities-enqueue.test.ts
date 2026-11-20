import { beforeEach, describe, expect, it, vi } from 'vitest';

import { teamsActivitiesEnqueueHandler } from 'src/features/chat/logic-functions/teams-activities-enqueue';
import { type TeamsActivitiesDispatchPayload } from 'src/features/chat/logic-functions/types/teams-activities-dispatch-payload.type';

const { enqueueRequestMock, answerRequestMock, enqueueWatchdogMock } =
  vi.hoisted(() => ({
    enqueueRequestMock: vi.fn(),
    answerRequestMock: vi.fn(),
    enqueueWatchdogMock: vi.fn(),
  }));

vi.mock(
  'src/features/chat/logic-functions/utils/enqueue-teams-assistant-request',
  () => ({
    enqueueTeamsAssistantRequest: enqueueRequestMock,
  }),
);

vi.mock(
  'src/features/chat/logic-functions/utils/answer-teams-assistant-request',
  () => ({
    answerTeamsAssistantRequest: answerRequestMock,
  }),
);

vi.mock(
  'src/features/chat/logic-functions/utils/enqueue-teams-assistant-request-watchdog',
  () => ({
    enqueueTeamsAssistantRequestWatchdog: enqueueWatchdogMock,
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

const REQUEST = { id: 'request-1', status: 'PENDING' };

describe('teamsActivitiesEnqueueHandler', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    enqueueRequestMock.mockResolvedValue({ ok: true, request: REQUEST });
    enqueueWatchdogMock.mockResolvedValue(undefined);
    answerRequestMock.mockResolvedValue({ status: 'answered' });
  });

  it('should schedule a watchdog for the request before answering it', async () => {
    const result = await teamsActivitiesEnqueueHandler(PAYLOAD);

    expect(result).toEqual({ status: 'answered' });
    expect(enqueueWatchdogMock).toHaveBeenCalledExactlyOnceWith({
      teamsAssistantRequestId: REQUEST.id,
    });
    expect(enqueueWatchdogMock.mock.invocationCallOrder[0]).toBeLessThan(
      answerRequestMock.mock.invocationCallOrder[0],
    );
  });

  it('should still answer the request when the watchdog cannot be scheduled', async () => {
    const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});

    enqueueWatchdogMock.mockRejectedValue(new Error('queue unreachable'));

    const result = await teamsActivitiesEnqueueHandler(PAYLOAD);

    expect(result).toEqual({ status: 'answered' });
    expect(answerRequestMock).toHaveBeenCalledExactlyOnceWith({
      request: REQUEST,
      agentDeadlineAtMs: expect.any(Number),
    });

    warnSpy.mockRestore();
  });
});
