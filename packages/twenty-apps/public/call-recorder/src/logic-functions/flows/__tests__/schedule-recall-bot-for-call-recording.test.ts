import { type CoreApiClient } from 'twenty-client-sdk/core';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { CHECK_CREDITS_BEFORE_RECALL_BOT_JOIN_LOGIC_FUNCTION_UNIVERSAL_IDENTIFIER } from 'src/constants/universal-identifiers';
import { ENQUEUED_JOB_RETRY_LIMIT } from 'src/logic-functions/constants/enqueued-job-retry-limit';
import { scheduleRecallBotForCallRecording } from 'src/logic-functions/flows/schedule-recall-bot-for-call-recording.util';

const getCreditAvailabilityMock = vi.hoisted(() => vi.fn());
const enqueueJobsMock = vi.hoisted(() => vi.fn());

vi.mock('twenty-sdk/billing', () => ({
  getCreditAvailability: getCreditAvailabilityMock,
}));

vi.mock('twenty-sdk/logic-function', async (importOriginal) => ({
  ...(await importOriginal<object>()),
  enqueueJobs: enqueueJobsMock,
}));

const fetchMock = vi.fn();

const NOW = new Date('2026-01-01T12:00:00.000Z');
const WORKSPACE_ID = '123e4567-e89b-12d3-a456-426614174000';
const MEETING_IN_ONE_HOUR_STARTS_AT = '2026-01-01T13:00:00.000Z';
const MEETING_IN_FIVE_MINUTES_STARTS_AT = '2026-01-01T12:05:00.000Z';
const RECALL_CREATE_BOT_URL = 'https://us-west-2.recall.ai/api/v1/bot/';

const buildAccessToken = (payload: Record<string, unknown>): string =>
  [
    Buffer.from(JSON.stringify({ alg: 'none' })).toString('base64url'),
    Buffer.from(JSON.stringify(payload)).toString('base64url'),
    'signature',
  ].join('.');

type CallRecordingNode = {
  id: string;
  status: string;
  recordingRequestStatus: string;
  calendarEventId: string;
  externalBotId: string | null;
  callRecorderFailureReason?: string | null;
};

class FakeCoreApiClient {
  callRecording: CallRecordingNode = {
    id: 'call-recording-1',
    status: 'SCHEDULED',
    recordingRequestStatus: 'REQUESTED',
    calendarEventId: 'calendar-event-1',
    externalBotId: null,
  };

  async query(query: any): Promise<any> {
    if (query.callRecordings !== undefined) {
      return {
        callRecordings: {
          pageInfo: { hasNextPage: false, endCursor: undefined },
          edges: [{ node: this.callRecording }],
        },
      };
    }

    throw new Error(`Unhandled query: ${JSON.stringify(query)}`);
  }

  async mutation(mutation: any): Promise<any> {
    if (mutation.updateCallRecordings !== undefined) {
      const { filter, data } = mutation.updateCallRecordings.__args;
      const isMatch = filter.status.in.includes(this.callRecording.status);

      if (isMatch) {
        Object.assign(this.callRecording, data);
      }

      return {
        updateCallRecordings: isMatch ? [{ id: this.callRecording.id }] : [],
      };
    }

    if (mutation.updateCallRecording !== undefined) {
      Object.assign(
        this.callRecording,
        mutation.updateCallRecording.__args.data,
      );

      return { updateCallRecording: { id: this.callRecording.id } };
    }

    throw new Error(`Unhandled mutation: ${JSON.stringify(mutation)}`);
  }
}

const scheduleBot = ({
  client,
  meetingStartsAt,
}: {
  client: FakeCoreApiClient;
  meetingStartsAt: string;
}) =>
  scheduleRecallBotForCallRecording(client as unknown as CoreApiClient, {
    callRecording: { id: 'call-recording-1' },
    calendarEvent: {
      id: 'calendar-event-1',
      title: 'Customer sync',
      isCanceled: false,
      startsAt: meetingStartsAt,
      endsAt: '2026-01-01T14:00:00.000Z',
      iCalUid: 'calendar-event-uid',
      conferenceLinkUrl: 'https://meet.example.com/customer-sync',
      callRecorderPreference: 'ON',
    },
  });

const createBotCalls = () =>
  fetchMock.mock.calls.filter(
    ([requestUrl, requestInit]) =>
      requestUrl === RECALL_CREATE_BOT_URL && requestInit?.method === 'POST',
  );

describe('scheduleRecallBotForCallRecording', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(NOW);
    vi.spyOn(console, 'warn').mockImplementation(() => {});
    vi.stubGlobal('fetch', fetchMock);
    vi.stubEnv('RECALL_API_KEY', 'recall-api-key');
    vi.stubEnv('RECALL_REGION', 'us-west-2');
    vi.stubEnv('CALL_RECORDER_USE_WORKSPACE_LOGO', 'false');
    vi.stubEnv(
      'TWENTY_APP_ACCESS_TOKEN',
      buildAccessToken({ workspaceId: WORKSPACE_ID }),
    );
    fetchMock.mockReset();
    fetchMock.mockImplementation(
      async () =>
        new Response(JSON.stringify({ id: 'recall-bot-1' }), { status: 201 }),
    );
    getCreditAvailabilityMock.mockReset();
    enqueueJobsMock.mockReset();
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    vi.unstubAllEnvs();
    vi.useRealTimers();
    vi.restoreAllMocks();
  });

  it('enqueues the credit check ten minutes before the join for a meeting that is far enough away', async () => {
    const client = new FakeCoreApiClient();

    const scheduleResult = await scheduleBot({
      client,
      meetingStartsAt: MEETING_IN_ONE_HOUR_STARTS_AT,
    });

    expect(scheduleResult).toEqual({ status: 'scheduled' });
    expect(client.callRecording.externalBotId).toBe('recall-bot-1');
    expect(getCreditAvailabilityMock).not.toHaveBeenCalled();
    expect(enqueueJobsMock).toHaveBeenCalledExactlyOnceWith({
      logicFunctionUniversalIdentifier:
        CHECK_CREDITS_BEFORE_RECALL_BOT_JOIN_LOGIC_FUNCTION_UNIVERSAL_IDENTIFIER,
      jobs: [
        {
          jobId: `credit-check.call-recording-1.recall-bot-1.${new Date('2026-01-01T12:59:00.000Z').getTime()}`,
          payload: { callRecordingId: 'call-recording-1' },
        },
      ],
      retryLimit: ENQUEUED_JOB_RETRY_LIMIT,
      delayMs: 49 * 60_000,
    });
  });

  it('creates no bot for a meeting about to start when the workspace is out of credits', async () => {
    getCreditAvailabilityMock.mockResolvedValue({
      hasAvailableCredits: false,
      reason: 'no-credits',
    });
    const client = new FakeCoreApiClient();

    const scheduleResult = await scheduleBot({
      client,
      meetingStartsAt: MEETING_IN_FIVE_MINUTES_STARTS_AT,
    });

    expect(scheduleResult).toEqual({
      status: 'blocked',
      failureReason: 'workspace_out_of_credits',
    });
    expect(createBotCalls()).toHaveLength(0);
    expect(enqueueJobsMock).not.toHaveBeenCalled();
    expect(client.callRecording).toMatchObject({
      status: 'NOT_RECORDED',
      callRecorderFailureReason: 'workspace_out_of_credits',
      externalBotId: null,
    });
  });

  it('creates the bot without a delayed check for a meeting about to start when credits are available', async () => {
    getCreditAvailabilityMock.mockResolvedValue({ hasAvailableCredits: true });
    const client = new FakeCoreApiClient();

    const scheduleResult = await scheduleBot({
      client,
      meetingStartsAt: MEETING_IN_FIVE_MINUTES_STARTS_AT,
    });

    expect(scheduleResult).toEqual({ status: 'scheduled' });
    expect(createBotCalls()).toHaveLength(1);
    expect(enqueueJobsMock).not.toHaveBeenCalled();
    expect(client.callRecording.status).toBe('SCHEDULED');
  });

  it('still schedules the bot when the credit check cannot be enqueued', async () => {
    enqueueJobsMock.mockRejectedValue(new Error('queue unavailable'));
    const client = new FakeCoreApiClient();

    const scheduleResult = await scheduleBot({
      client,
      meetingStartsAt: MEETING_IN_ONE_HOUR_STARTS_AT,
    });

    expect(scheduleResult).toEqual({ status: 'scheduled' });
    expect(client.callRecording.externalBotId).toBe('recall-bot-1');
    expect(console.warn).toHaveBeenCalledWith(
      expect.stringContaining('failed to enqueue the pre-join credit check'),
    );
  });
});
