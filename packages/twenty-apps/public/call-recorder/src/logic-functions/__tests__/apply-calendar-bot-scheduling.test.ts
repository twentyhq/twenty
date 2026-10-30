import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import {
  APPLY_CALENDAR_BOT_SCHEDULING_LOGIC_FUNCTION_UNIVERSAL_IDENTIFIER,
  CANCEL_SCHEDULED_RECALL_BOTS_LOGIC_FUNCTION_UNIVERSAL_IDENTIFIER,
  FOLLOW_UP_CALL_RECORDING_REQUEST_LOGIC_FUNCTION_UNIVERSAL_IDENTIFIER,
  SWEEP_UPCOMING_CALENDAR_EVENTS_LOGIC_FUNCTION_UNIVERSAL_IDENTIFIER,
} from 'src/constants/universal-identifiers';
import applyLogicFunction, {
  applyCalendarBotSchedulingHandler,
} from 'src/logic-functions/apply-calendar-bot-scheduling';
import { CALENDAR_BOT_SCHEDULING_APPLY_RETRY_DELAYS_MS } from 'src/logic-functions/constants/calendar-bot-scheduling-apply-retry-delays-ms';
import { CALL_RECORDER_CALENDAR_BOT_SCHEDULING_ENABLED_ENV_VAR_NAME } from 'src/logic-functions/constants/call-recorder-calendar-bot-scheduling-enabled-env-var-name';
import { buildCalendarBotSchedulingApplyJob } from 'src/logic-functions/domain/build-calendar-bot-scheduling-apply-job.util';

const queryMock = vi.hoisted(() => vi.fn());
const mutationMock = vi.hoisted(() => vi.fn());
const enqueueJobsMock = vi.hoisted(() => vi.fn());

vi.mock('twenty-client-sdk/core', () => ({
  CoreApiClient: class {
    query = queryMock;
    mutation = mutationMock;
  },
}));

vi.mock('twenty-sdk/logic-function', async (importOriginal) => ({
  ...(await importOriginal<object>()),
  enqueueJobs: enqueueJobsMock,
}));

const NOW = new Date('2026-10-30T12:00:05.000Z');

const buildConnection = <TNode>(nodes: TNode[]) => ({
  pageInfo: { hasNextPage: false, endCursor: null },
  edges: nodes.map((node) => ({ node })),
});

const setCalendarBotSchedulingEnabled = (isEnabled: boolean) =>
  vi.stubEnv(
    CALL_RECORDER_CALENDAR_BOT_SCHEDULING_ENABLED_ENV_VAR_NAME,
    String(isEnabled),
  );

const getEnqueuedLogicFunctionUniversalIdentifiers = () =>
  new Set(
    enqueueJobsMock.mock.calls.map(
      ([input]) => input.logicFunctionUniversalIdentifier,
    ),
  );

const getEnqueuedApplyRetries = () =>
  enqueueJobsMock.mock.calls
    .map(([input]) => input)
    .filter(
      (input) =>
        input.logicFunctionUniversalIdentifier ===
        APPLY_CALENDAR_BOT_SCHEDULING_LOGIC_FUNCTION_UNIVERSAL_IDENTIFIER,
    );

describe('applyCalendarBotSchedulingHandler', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.useFakeTimers();
    vi.setSystemTime(NOW);
    queryMock.mockResolvedValue({
      callRecordings: buildConnection([
        {
          id: 'open-call-recording',
          recordingRequestStatus: 'REQUESTED',
          status: 'SCHEDULED',
          externalBotId: 'recall-bot-1',
        },
        {
          id: 'call-recording-awaiting-cleanup',
          recordingRequestStatus: 'CANCELED',
          status: 'SCHEDULED',
          externalBotId: 'recall-bot-2',
        },
      ]),
    });
    mutationMock.mockResolvedValue({
      updateCallRecordings: [{ id: 'open-call-recording' }],
    });
    enqueueJobsMock.mockResolvedValue({ enqueued: true });
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.unstubAllEnvs();
  });

  it('runs only as a queued job', () => {
    expect(applyLogicFunction.config.httpRouteTriggerSettings).toBeUndefined();
  });

  it('sweeps upcoming meetings when recording is on', async () => {
    setCalendarBotSchedulingEnabled(true);

    await expect(applyCalendarBotSchedulingHandler({})).resolves.toEqual({
      outcome: 'sweep-enqueued',
    });
    expect(getEnqueuedLogicFunctionUniversalIdentifiers()).toEqual(
      new Set([
        SWEEP_UPCOMING_CALENDAR_EVENTS_LOGIC_FUNCTION_UNIVERSAL_IDENTIFIER,
      ]),
    );
    expect(mutationMock).not.toHaveBeenCalled();
  });

  it('cancels open requests and enqueues the Recall bot cleanup when recording is off', async () => {
    setCalendarBotSchedulingEnabled(false);

    await expect(applyCalendarBotSchedulingHandler({})).resolves.toEqual({
      outcome: 'scheduled-bots-canceled',
      canceledCallRecordingCount: 1,
    });
    expect(getEnqueuedLogicFunctionUniversalIdentifiers()).toEqual(
      new Set([
        CANCEL_SCHEDULED_RECALL_BOTS_LOGIC_FUNCTION_UNIVERSAL_IDENTIFIER,
        SWEEP_UPCOMING_CALENDAR_EVENTS_LOGIC_FUNCTION_UNIVERSAL_IDENTIFIER,
        FOLLOW_UP_CALL_RECORDING_REQUEST_LOGIC_FUNCTION_UNIVERSAL_IDENTIFIER,
      ]),
    );
  });

  it('still arms the follow-ups and asks for redelivery when the cleanup cannot be enqueued', async () => {
    setCalendarBotSchedulingEnabled(false);
    enqueueJobsMock.mockImplementation(
      async ({ logicFunctionUniversalIdentifier }) => {
        if (
          logicFunctionUniversalIdentifier ===
          CANCEL_SCHEDULED_RECALL_BOTS_LOGIC_FUNCTION_UNIVERSAL_IDENTIFIER
        ) {
          throw new Error('queue unavailable');
        }

        return { enqueued: true };
      },
    );

    await expect(applyCalendarBotSchedulingHandler({})).rejects.toMatchObject({
      name: 'RetryableLogicFunctionError',
      message: expect.stringContaining('queue unavailable'),
    });
    expect(getEnqueuedLogicFunctionUniversalIdentifiers()).toContain(
      FOLLOW_UP_CALL_RECORDING_REQUEST_LOGIC_FUNCTION_UNIVERSAL_IDENTIFIER,
    );
  });

  it.each(
    CALENDAR_BOT_SCHEDULING_APPLY_RETRY_DELAYS_MS.map((_, attempt) => attempt),
  )('retries a failed attempt %i later as its own job', async (attempt) => {
    setCalendarBotSchedulingEnabled(false);
    queryMock.mockRejectedValue(new Error('Service unavailable'));

    await expect(
      applyCalendarBotSchedulingHandler({ attempt }),
    ).rejects.toMatchObject({ name: 'RetryableLogicFunctionError' });

    const [retry] = getEnqueuedApplyRetries();

    expect(getEnqueuedApplyRetries()).toHaveLength(1);
    expect(retry.delayMs).toBe(
      CALENDAR_BOT_SCHEDULING_APPLY_RETRY_DELAYS_MS[attempt],
    );
    expect(retry.jobs).toEqual([
      {
        jobId: expect.any(String),
        payload: { attempt: attempt + 1, applyJobId: expect.any(String) },
      },
    ]);
    expect(retry.jobs[0].jobId).not.toBe(
      buildCalendarBotSchedulingApplyJob({ now: NOW.getTime() }).jobId,
    );
  });

  it('keys every retry to the window job it started from, whenever it runs', async () => {
    setCalendarBotSchedulingEnabled(false);
    queryMock.mockRejectedValue(new Error('Service unavailable'));
    const applyJobId = 'call-recorder-calendar-bot-scheduling-apply-7';

    await expect(
      applyCalendarBotSchedulingHandler({ attempt: 1, applyJobId }),
    ).rejects.toMatchObject({ name: 'RetryableLogicFunctionError' });
    vi.setSystemTime(NOW.getTime() + 60_000);
    await expect(
      applyCalendarBotSchedulingHandler({ attempt: 1, applyJobId }),
    ).rejects.toMatchObject({ name: 'RetryableLogicFunctionError' });

    expect(getEnqueuedApplyRetries().map((retry) => retry.jobs[0])).toEqual([
      { jobId: `${applyJobId}-retry-2`, payload: { attempt: 2, applyJobId } },
      { jobId: `${applyJobId}-retry-2`, payload: { attempt: 2, applyJobId } },
    ]);
  });

  it('gives up after the last retry', async () => {
    setCalendarBotSchedulingEnabled(false);
    queryMock.mockRejectedValue(new Error('Service unavailable'));

    await expect(
      applyCalendarBotSchedulingHandler({
        attempt: CALENDAR_BOT_SCHEDULING_APPLY_RETRY_DELAYS_MS.length,
      }),
    ).rejects.toMatchObject({ name: 'RetryableLogicFunctionError' });
    expect(getEnqueuedApplyRetries()).toEqual([]);
  });
});
