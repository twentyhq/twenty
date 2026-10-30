import { isUndefined } from '@sniptt/guards';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { buildCallRecordingRequestFollowUpJobId } from 'src/logic-functions/domain/build-call-recording-request-follow-up-job-id.util';
import { computeCallRecordingIdForMeeting } from 'src/logic-functions/domain/compute-call-recording-id-for-meeting.util';
import { computeDeferredRecallBotDeletionAt } from 'src/logic-functions/domain/compute-deferred-recall-bot-deletion-at.util';
import { followUpCallRecordingRequestHandler } from 'src/logic-functions/follow-up-call-recording-request';

const queryMock = vi.hoisted(() => vi.fn());
const mutationMock = vi.hoisted(() => vi.fn());
const metadataQueryMock = vi.hoisted(() => vi.fn());
const enqueueJobsMock = vi.hoisted(() => vi.fn());

vi.mock('twenty-client-sdk/core', () => ({
  CoreApiClient: class {
    query = queryMock;
    mutation = mutationMock;
  },
}));

vi.mock('twenty-client-sdk/metadata', async (importOriginal) => ({
  ...(await importOriginal<typeof import('twenty-client-sdk/metadata')>()),
  MetadataApiClient: class {
    query = metadataQueryMock;
  },
}));

vi.mock('twenty-sdk/logic-function', async (importOriginal) => ({
  ...(await importOriginal<object>()),
  enqueueJobs: enqueueJobsMock,
}));

const fetchMock = vi.fn();

const NOW = new Date('2026-01-01T12:00:00.000Z');
const MEETING_STARTS_AT = '2026-01-02T09:00:00.000Z';
const CALL_RECORDING_ID = computeCallRecordingIdForMeeting(
  `link:meet.example.com/customer-sync:${MEETING_STARTS_AT}`,
);
const CALENDAR_EVENT = {
  id: 'calendar-event-1',
  title: 'Customer sync',
  isCanceled: false,
  startsAt: MEETING_STARTS_AT,
  endsAt: '2026-01-02T10:00:00.000Z',
  iCalUid: undefined,
  conferenceLinkUrl: 'https://meet.example.com/customer-sync',
  callRecorderPreference: 'OFF',
};

const buildConnection = <TNode>(nodes: TNode[]) => ({
  pageInfo: { hasNextPage: false, endCursor: undefined },
  edges: nodes.map((node) => ({ node })),
});

const getDeferredRecallBotDeletionAt = (): Date => {
  const deferredRecallBotDeletionAt = computeDeferredRecallBotDeletionAt({
    callRecordingId: CALL_RECORDING_ID,
    calendarEvent: CALENDAR_EVENT,
    now: NOW,
  });

  if (isUndefined(deferredRecallBotDeletionAt)) {
    throw new Error('Expected the meeting to have a deferred deletion time');
  }

  return deferredRecallBotDeletionAt;
};

const getEnqueuedFollowUp = () => {
  const [{ jobs, delayMs }] = enqueueJobsMock.mock.calls[0];

  return { jobId: jobs[0].jobId, payload: jobs[0].payload, delayMs };
};

describe('followUpCallRecordingRequestHandler', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(NOW);
    vi.spyOn(console, 'warn').mockImplementation(() => {});
    vi.spyOn(console, 'error').mockImplementation(() => {});
    vi.stubGlobal('fetch', fetchMock);
    vi.stubEnv('RECALL_API_KEY', 'recall-api-key');
    vi.stubEnv('RECALL_REGION', 'us-west-2');
    fetchMock.mockReset();
    fetchMock.mockResolvedValue(new Response(null, { status: 403 }));
    enqueueJobsMock.mockReset().mockResolvedValue({ enqueued: true });
    mutationMock.mockReset().mockResolvedValue({ updateCallRecordings: [] });
    metadataQueryMock.mockReset().mockResolvedValue({
      currentWorkspace: {
        featureFlags: [{ key: 'IS_APP_PREFERENCES_ENABLED', value: true }],
      },
    });
    queryMock.mockReset().mockImplementation(async (query: any) => {
      if (!isUndefined(query.callRecordings)) {
        return {
          callRecordings: buildConnection([
            {
              id: CALL_RECORDING_ID,
              status: 'SCHEDULED',
              recordingRequestStatus: 'CANCELED',
              updatedAt: NOW.toISOString(),
              calendarEventId: 'calendar-event-1',
              externalBotId: 'recall-bot-1',
            },
          ]),
        };
      }

      if (!isUndefined(query.calendarEvents)) {
        return {
          calendarEvents: buildConnection([
            {
              ...CALENDAR_EVENT,
              conferenceLink: {
                primaryLinkUrl: CALENDAR_EVENT.conferenceLinkUrl,
              },
            },
          ]),
        };
      }

      throw new Error(`Unhandled query: ${JSON.stringify(query)}`);
    });
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.unstubAllGlobals();
    vi.unstubAllEnvs();
    vi.restoreAllMocks();
  });

  it('re-arms a canceled request for its deletion window without touching Recall', async () => {
    const deferredRecallBotDeletionAt = getDeferredRecallBotDeletionAt();

    const result = await followUpCallRecordingRequestHandler({
      callRecordingId: CALL_RECORDING_ID,
      attempt: 0,
    });

    expect(result).toEqual({
      status: 'follow-up-again',
      reason: 'waiting for the Recall bot deletion window',
      dueAt: deferredRecallBotDeletionAt,
    });
    expect(fetchMock).not.toHaveBeenCalled();
    expect(getEnqueuedFollowUp()).toEqual({
      jobId: buildCallRecordingRequestFollowUpJobId({
        callRecordingId: CALL_RECORDING_ID,
        attempt: 1,
        dueAt: deferredRecallBotDeletionAt,
      }),
      payload: { callRecordingId: CALL_RECORDING_ID, attempt: 1 },
      delayMs: deferredRecallBotDeletionAt.getTime() - NOW.getTime(),
    });
  });

  it('cancels the bot right away when deferral is disabled', async () => {
    metadataQueryMock.mockResolvedValue({
      currentWorkspace: { featureFlags: [] },
    });
    fetchMock.mockResolvedValue(new Response(null, { status: 204 }));

    const result = await followUpCallRecordingRequestHandler({
      callRecordingId: CALL_RECORDING_ID,
    });

    expect(result).toEqual({
      status: 'settled',
      outcome: 'Recall bot cancellation canceled',
    });
    expect(fetchMock).toHaveBeenCalledExactlyOnceWith(
      'https://us-west-2.recall.ai/api/v1/bot/recall-bot-1/',
      expect.objectContaining({ method: 'DELETE' }),
    );
    expect(enqueueJobsMock).not.toHaveBeenCalled();
  });
});
