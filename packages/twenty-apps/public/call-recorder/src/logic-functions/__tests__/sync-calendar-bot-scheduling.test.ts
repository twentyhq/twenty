import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { SWEEP_UPCOMING_CALENDAR_EVENTS_LOGIC_FUNCTION_UNIVERSAL_IDENTIFIER } from 'src/constants/universal-identifiers';
import { CALL_RECORDER_CALENDAR_BOT_SCHEDULING_ENABLED_ENV_VAR_NAME } from 'src/logic-functions/constants/call-recorder-calendar-bot-scheduling-enabled-env-var-name';
import { ENQUEUED_JOB_RETRY_LIMIT } from 'src/logic-functions/constants/enqueued-job-retry-limit';

const mocks = vi.hoisted(() => ({
  cancelCallRecordingRequest: vi.fn(),
  enqueueJobs: vi.fn(),
  findOpenScheduledCallRecordings: vi.fn(),
}));

vi.mock('twenty-client-sdk/core', () => ({
  CoreApiClient: class CoreApiClient {},
}));

vi.mock('twenty-sdk/logic-function', async (importOriginal) => ({
  ...(await importOriginal<object>()),
  enqueueJobs: mocks.enqueueJobs,
}));

vi.mock(
  'src/logic-functions/data/find-open-scheduled-call-recordings.util',
  () => ({
    findOpenScheduledCallRecordings: mocks.findOpenScheduledCallRecordings,
  }),
);

vi.mock('src/logic-functions/flows/cancel-call-recording-request.util', () => ({
  cancelCallRecordingRequest: mocks.cancelCallRecordingRequest,
}));

import syncCalendarBotSchedulingLogicFunction, {
  syncCalendarBotSchedulingHandler,
} from 'src/logic-functions/sync-calendar-bot-scheduling';

describe('sync-calendar-bot-scheduling', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.enqueueJobs.mockResolvedValue({
      enqueued: true,
      enqueuedJobsCount: 1,
    });
    mocks.findOpenScheduledCallRecordings.mockResolvedValue([
      { id: 'call-recording-1', externalBotId: 'recall-bot-1' },
      { id: 'call-recording-2' },
    ]);
    mocks.cancelCallRecordingRequest.mockResolvedValue(undefined);
    vi.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    vi.unstubAllEnvs();
    vi.restoreAllMocks();
  });

  it('is exposed as an authenticated POST route', () => {
    expect(syncCalendarBotSchedulingLogicFunction.config).toEqual(
      expect.objectContaining({
        name: 'sync-calendar-bot-scheduling',
        httpRouteTriggerSettings: {
          path: '/call-recorder/sync-calendar-bot-scheduling',
          httpMethod: 'POST',
          isAuthRequired: true,
        },
      }),
    );
  });

  it('cancels every open scheduled recording request when scheduling is off', async () => {
    vi.stubEnv(
      CALL_RECORDER_CALENDAR_BOT_SCHEDULING_ENABLED_ENV_VAR_NAME,
      'false',
    );

    const result = await syncCalendarBotSchedulingHandler();

    expect(mocks.cancelCallRecordingRequest).toHaveBeenCalledTimes(2);
    expect(mocks.cancelCallRecordingRequest).toHaveBeenCalledWith({
      client: expect.anything(),
      callRecording: { id: 'call-recording-1', externalBotId: 'recall-bot-1' },
    });
    expect(mocks.cancelCallRecordingRequest).toHaveBeenCalledWith({
      client: expect.anything(),
      callRecording: { id: 'call-recording-2' },
    });
    expect(mocks.enqueueJobs).not.toHaveBeenCalled();
    expect(result).toEqual({
      outcome: 'scheduled-bots-canceled',
      canceledCallRecordingIds: ['call-recording-1', 'call-recording-2'],
      failedCallRecordingIds: [],
    });
  });

  it('keeps cancelling the remaining requests when one cancellation throws', async () => {
    vi.stubEnv(
      CALL_RECORDER_CALENDAR_BOT_SCHEDULING_ENABLED_ENV_VAR_NAME,
      'false',
    );
    mocks.cancelCallRecordingRequest
      .mockRejectedValueOnce(new Error('update failed'))
      .mockResolvedValueOnce(undefined);

    const result = await syncCalendarBotSchedulingHandler();

    expect(mocks.cancelCallRecordingRequest).toHaveBeenCalledTimes(2);
    expect(result).toEqual({
      outcome: 'scheduled-bots-canceled',
      canceledCallRecordingIds: ['call-recording-2'],
      failedCallRecordingIds: ['call-recording-1'],
    });
  });

  it('enqueues the upcoming calendar events sweep when scheduling is on', async () => {
    vi.stubEnv(
      CALL_RECORDER_CALENDAR_BOT_SCHEDULING_ENABLED_ENV_VAR_NAME,
      'true',
    );

    const result = await syncCalendarBotSchedulingHandler();

    expect(mocks.findOpenScheduledCallRecordings).not.toHaveBeenCalled();
    expect(mocks.cancelCallRecordingRequest).not.toHaveBeenCalled();
    expect(mocks.enqueueJobs).toHaveBeenCalledExactlyOnceWith({
      logicFunctionUniversalIdentifier:
        SWEEP_UPCOMING_CALENDAR_EVENTS_LOGIC_FUNCTION_UNIVERSAL_IDENTIFIER,
      payloads: [{}],
      retryLimit: ENQUEUED_JOB_RETRY_LIMIT,
    });
    expect(result).toEqual({ outcome: 'sweep-enqueued' });
  });

  it('treats an unset variable as scheduling on', async () => {
    const result = await syncCalendarBotSchedulingHandler();

    expect(mocks.cancelCallRecordingRequest).not.toHaveBeenCalled();
    expect(result).toEqual({ outcome: 'sweep-enqueued' });
  });
});
