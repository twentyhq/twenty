import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import scheduleRecallBotOnCallRecordingUpdateLogicFunction, {
  scheduleRecallBotOnCallRecordingUpdateHandler,
} from 'src/logic-functions/schedule-recall-bot-on-call-recording-update';

const queryMock = vi.hoisted(() => vi.fn());
const mutationMock = vi.hoisted(() => vi.fn());

vi.mock('twenty-client-sdk/core', () => ({
  CoreApiClient: class {
    query = queryMock;
    mutation = mutationMock;
  },
}));

const fetchMock = vi.fn();

const NOW = new Date('2026-01-01T12:00:00.000Z');
const WORKSPACE_ID = '123e4567-e89b-12d3-a456-426614174000';
const RECALL_CREATE_BOT_URL = 'https://us-west-2.recall.ai/api/v1/bot/';

const buildAccessToken = (payload: Record<string, unknown>): string =>
  [
    Buffer.from(JSON.stringify({ alg: 'none' })).toString('base64url'),
    Buffer.from(JSON.stringify(payload)).toString('base64url'),
    'signature',
  ].join('.');

const buildConnection = <Node>(nodes: Node[]) => ({
  pageInfo: { hasNextPage: false, endCursor: undefined },
  edges: nodes.map((node) => ({ node })),
});

type HandlerEvent = Parameters<
  typeof scheduleRecallBotOnCallRecordingUpdateHandler
>[0];

const buildUpdateEvent = (overrides: Partial<HandlerEvent> = {}): HandlerEvent =>
  ({
    name: 'callRecording.updated',
    recordId: 'call-recording-1',
    properties: {
      updatedFields: ['externalBotId'],
      before: {
        id: 'call-recording-1',
        status: 'SCHEDULED',
        recordingRequestStatus: 'REQUESTED',
        externalBotId: 'recall-bot-vanished',
      },
      after: {
        id: 'call-recording-1',
        status: 'SCHEDULED',
        recordingRequestStatus: 'REQUESTED',
        externalBotId: null,
      },
    },
    ...overrides,
  }) as HandlerEvent;

const stubPendingCallRecordingQueries = () => {
  queryMock.mockImplementation(async (query: any) => {
    if (query.callRecordings !== undefined) {
      return {
        callRecordings: buildConnection([
          {
            id: 'call-recording-1',
            status: 'SCHEDULED',
            recordingRequestStatus: 'REQUESTED',
            calendarEventId: 'calendar-event-1',
            externalBotId: null,
            botScheduleAttemptedAt: null,
          },
        ]),
      };
    }

    if (query.calendarEvents !== undefined) {
      return {
        calendarEvents: buildConnection([
          {
            id: 'calendar-event-1',
            startsAt: '2026-01-01T13:00:00.000Z',
            endsAt: '2026-01-01T14:00:00.000Z',
            iCalUid: 'calendar-event-uid',
            conferenceLink: {
              primaryLinkUrl: 'https://meet.example.com/customer-sync',
            },
          },
        ]),
      };
    }

    throw new Error(`Unhandled query: ${JSON.stringify(query)}`);
  });
};

describe('scheduleRecallBotOnCallRecordingUpdateHandler', () => {
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
    queryMock.mockReset();
    mutationMock.mockReset();
    mutationMock.mockImplementation(async (mutation: any) => ({
      updateCallRecording: { id: mutation.updateCallRecording.__args.id },
    }));
    fetchMock.mockReset();
    fetchMock.mockImplementation(async (requestUrl: string) => {
      if (requestUrl === RECALL_CREATE_BOT_URL) {
        return new Response(JSON.stringify({ id: 'recall-bot-new' }), {
          status: 201,
        });
      }

      throw new Error(`Unhandled fetch in test: ${requestUrl}`);
    });
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    vi.unstubAllEnvs();
    vi.useRealTimers();
    vi.restoreAllMocks();
  });

  it('declares the pending-transition fields on the trigger so the server drops other updates', () => {
    expect(
      scheduleRecallBotOnCallRecordingUpdateLogicFunction.config
        .databaseEventTriggerSettings,
    ).toEqual({
      eventName: 'callRecording.updated',
      updatedFields: [
        'recordingRequestStatus',
        'status',
        'externalBotId',
        'calendarEventId',
      ],
    });
  });

  it('schedules a bot when an update clears the bot id of a requested recording', async () => {
    stubPendingCallRecordingQueries();

    const result = await scheduleRecallBotOnCallRecordingUpdateHandler(
      buildUpdateEvent(),
    );

    expect(result).toEqual({
      callRecordingId: 'call-recording-1',
      result: { status: 'scheduled' },
    });
    expect(fetchMock).toHaveBeenCalledTimes(1);
    expect(fetchMock).toHaveBeenCalledWith(
      RECALL_CREATE_BOT_URL,
      expect.objectContaining({ method: 'POST' }),
    );
  });

  it('skips events that are not call recording updates', async () => {
    const result = await scheduleRecallBotOnCallRecordingUpdateHandler(
      buildUpdateEvent({ name: 'callRecording.created' } as HandlerEvent),
    );

    expect(result).toEqual({
      skipped: true,
      reason: 'not a call recording update',
    });
    expect(queryMock).not.toHaveBeenCalled();
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it('skips its own scheduling-progress writes so it cannot re-trigger itself', async () => {
    const result = await scheduleRecallBotOnCallRecordingUpdateHandler(
      buildUpdateEvent({
        properties: {
          updatedFields: [
            'botScheduleAttemptedAt',
            'botScheduleIdempotencyKey',
          ],
          before: {},
          after: {
            id: 'call-recording-1',
            status: 'SCHEDULED',
            recordingRequestStatus: 'REQUESTED',
            externalBotId: null,
          },
        },
      } as unknown as HandlerEvent),
    );

    expect(result).toEqual({
      skipped: true,
      reason: 'no pending-transition field changed',
    });
    expect(queryMock).not.toHaveBeenCalled();
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it('skips updates that leave the recording with a bot attached', async () => {
    const result = await scheduleRecallBotOnCallRecordingUpdateHandler(
      buildUpdateEvent({
        properties: {
          updatedFields: ['externalBotId'],
          before: {},
          after: {
            id: 'call-recording-1',
            status: 'SCHEDULED',
            recordingRequestStatus: 'REQUESTED',
            externalBotId: 'recall-bot-1',
          },
        },
      } as unknown as HandlerEvent),
    );

    expect(result).toEqual({
      skipped: true,
      reason: 'call recording is not pending',
    });
    expect(queryMock).not.toHaveBeenCalled();
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it('defers rows with an ambiguous prior attempt to the recovery cron instead of listing bots', async () => {
    queryMock.mockImplementationOnce(async () => ({
      callRecordings: buildConnection([
        {
          id: 'call-recording-1',
          status: 'SCHEDULED',
          recordingRequestStatus: 'REQUESTED',
          calendarEventId: 'calendar-event-1',
          externalBotId: null,
          botScheduleAttemptedAt: '2026-01-01T11:55:00.000Z',
          botScheduleIdempotencyKey: 'stale-key-from-moved-meeting',
        },
      ]),
    }));
    queryMock.mockImplementationOnce(async () => ({
      calendarEvents: buildConnection([
        {
          id: 'calendar-event-1',
          startsAt: '2026-01-01T13:00:00.000Z',
          endsAt: '2026-01-01T14:00:00.000Z',
          conferenceLink: {
            primaryLinkUrl: 'https://meet.example.com/customer-sync',
          },
        },
      ]),
    }));

    const result = await scheduleRecallBotOnCallRecordingUpdateHandler(
      buildUpdateEvent(),
    );

    expect(result).toEqual({
      callRecordingId: 'call-recording-1',
      result: {
        status: 'deferred',
        reason: 'ambiguous prior attempt; the recovery cron will reconcile it',
      },
    });
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it('skips slim payloads whose diff shows the bot id was written back', async () => {
    const result = await scheduleRecallBotOnCallRecordingUpdateHandler(
      buildUpdateEvent({
        properties: {
          updatedFields: ['externalBotId'],
          diff: {
            externalBotId: { before: null, after: 'recall-bot-1' },
          },
        },
      } as unknown as HandlerEvent),
    );

    expect(result).toEqual({
      skipped: true,
      reason: 'call recording is not pending',
    });
    expect(queryMock).not.toHaveBeenCalled();
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it('does not schedule anything when the meeting already ended', async () => {
    stubPendingCallRecordingQueries();
    queryMock.mockImplementationOnce(async () => ({
      callRecordings: buildConnection([
        {
          id: 'call-recording-1',
          status: 'SCHEDULED',
          recordingRequestStatus: 'REQUESTED',
          calendarEventId: 'calendar-event-1',
          externalBotId: null,
        },
      ]),
    }));
    queryMock.mockImplementationOnce(async () => ({
      calendarEvents: buildConnection([
        {
          id: 'calendar-event-1',
          startsAt: '2026-01-01T10:00:00.000Z',
          endsAt: '2026-01-01T11:00:00.000Z',
        },
      ]),
    }));

    const result = await scheduleRecallBotOnCallRecordingUpdateHandler(
      buildUpdateEvent(),
    );

    expect(result).toEqual({
      callRecordingId: 'call-recording-1',
      result: { status: 'skipped', reason: 'meeting already ended' },
    });
    expect(fetchMock).not.toHaveBeenCalled();
  });
});
