import { isDefined } from 'twenty-sdk/utils';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { findLatestTeamsCallRecordingIdsForCalendarEventsOrThrow } from 'src/features/transcripts/logic-functions/utils/find-latest-teams-call-recording-ids-for-calendar-events-or-throw';

type CallRecordingNode = { id: string; calendarEventId: string | null };

type QueryRequest = {
  callRecordings: {
    __args: { filter: { calendarEventId: { in: string[] } }; after?: string };
  };
};

const toConnection = ({
  nodes,
  endCursor,
}: {
  nodes: CallRecordingNode[];
  endCursor?: string;
}) => ({
  callRecordings: {
    edges: nodes.map((node) => ({ node })),
    pageInfo: {
      hasNextPage: isDefined(endCursor),
      endCursor: endCursor ?? null,
    },
  },
});

describe('findLatestTeamsCallRecordingIdsForCalendarEventsOrThrow', () => {
  beforeEach(() => {
    vi.stubEnv('APPLICATION_ID', 'teams-application');
  });

  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it('should keep the first recording of each event from one query', async () => {
    const query = vi.fn(async () =>
      toConnection({
        nodes: [
          { id: 'recording-a-latest', calendarEventId: 'event-a' },
          { id: 'recording-b-latest', calendarEventId: 'event-b' },
          { id: 'recording-a-older', calendarEventId: 'event-a' },
        ],
      }),
    );

    await expect(
      findLatestTeamsCallRecordingIdsForCalendarEventsOrThrow({
        coreApiClient: { query },
        calendarEventIds: ['event-a', 'event-b'],
      }),
    ).resolves.toEqual(['recording-a-latest', 'recording-b-latest']);
    expect(query).toHaveBeenCalledTimes(1);
  });

  it('should read further pages only until every event has a recording', async () => {
    const query = vi.fn(async (request: QueryRequest) => {
      switch (request.callRecordings.__args.after) {
        case undefined:
          return toConnection({
            nodes: [{ id: 'recording-a-1', calendarEventId: 'event-a' }],
            endCursor: 'cursor-1',
          });
        case 'cursor-1':
          return toConnection({
            nodes: [
              { id: 'recording-a-2', calendarEventId: 'event-a' },
              { id: 'recording-b-1', calendarEventId: 'event-b' },
            ],
            endCursor: 'cursor-2',
          });
        default:
          throw new Error('Unexpected page');
      }
    });

    await expect(
      findLatestTeamsCallRecordingIdsForCalendarEventsOrThrow({
        coreApiClient: { query },
        calendarEventIds: ['event-a', 'event-b'],
      }),
    ).resolves.toEqual(['recording-a-1', 'recording-b-1']);
    expect(query).toHaveBeenCalledTimes(2);
  });

  it('should stop on the last page when an event has no Teams recording', async () => {
    const query = vi.fn(async () =>
      toConnection({
        nodes: [{ id: 'recording-a-1', calendarEventId: 'event-a' }],
      }),
    );

    await expect(
      findLatestTeamsCallRecordingIdsForCalendarEventsOrThrow({
        coreApiClient: { query },
        calendarEventIds: ['event-a', 'event-without-recording'],
      }),
    ).resolves.toEqual(['recording-a-1']);
    expect(query).toHaveBeenCalledTimes(1);
  });

  it('should query more than 200 events in batches', async () => {
    const calendarEventIds = Array.from(
      { length: 201 },
      (_, index) => `event-${index}`,
    );
    const query = vi.fn(async (request: QueryRequest) =>
      toConnection({
        nodes: request.callRecordings.__args.filter.calendarEventId.in.map(
          (calendarEventId) => ({
            id: `recording-${calendarEventId}`,
            calendarEventId,
          }),
        ),
      }),
    );

    const callRecordingIds =
      await findLatestTeamsCallRecordingIdsForCalendarEventsOrThrow({
        coreApiClient: { query },
        calendarEventIds,
      });

    expect(
      query.mock.calls.map(
        ([request]) =>
          request.callRecordings.__args.filter.calendarEventId.in.length,
      ),
    ).toEqual([200, 1]);
    expect(callRecordingIds).toHaveLength(201);
  });
});
