import { isUndefined } from '@sniptt/guards';
import { describe, expect, it, type Mock, vi } from 'vitest';

import { CALL_RECORDINGS_WIDGET_MAX_CALENDAR_EVENT_TARGET_PAGES } from 'src/front-components/constants/call-recordings-widget-max-calendar-event-target-pages.constant';
import { fetchCallRecordingsForRecord } from 'src/front-components/utils/fetch-call-recordings-for-record.util';
import { TWENTY_PAGE_SIZE } from 'src/logic-functions/constants/twenty-page-size';

type QueryRequest = {
  calendarEventTargets?: { __args: { orderBy: unknown } };
  callRecordings?: {
    __args: {
      filter: { calendarEventId: { in: string[] }; status: unknown };
      after?: string;
    };
    edges: { node: { calendarEvent?: unknown } };
  };
};

const buildPermissionDeniedError = () =>
  Object.assign(new Error('Permission denied'), {
    errors: [
      {
        message: 'Permission denied',
        extensions: { code: 'FORBIDDEN', subCode: 'PERMISSION_DENIED' },
      },
    ],
  });

const buildCalendarEventTargetConnection = (
  calendarEventIds: Array<string | null>,
  hasNextPage = false,
) => ({
  calendarEventTargets: {
    pageInfo: {
      hasNextPage,
      endCursor: hasNextPage ? 'next-target-cursor' : null,
    },
    edges: calendarEventIds.map((calendarEventId, targetIndex) => ({
      node: { id: `target-${targetIndex}`, calendarEventId },
    })),
  },
});

type CallRecordingFixture = {
  id: string;
  startedAt?: string | null;
  createdAt?: string;
  calendarEvent?: { id: string; startsAt: string } | null;
};

const buildCallRecordingConnection = (
  callRecordings: CallRecordingFixture[],
  hasNextPage = false,
) => ({
  callRecordings: {
    pageInfo: {
      hasNextPage,
      endCursor: hasNextPage ? 'next-recording-cursor' : null,
    },
    edges: callRecordings.map((callRecording) => ({ node: callRecording })),
  },
});

const isCalendarEventTargetQuery = (request: QueryRequest) =>
  'calendarEventTargets' in request;

const getCallRecordingQueries = (query: Mock) =>
  query.mock.calls
    .map(([request]) => request as QueryRequest)
    .flatMap((request) =>
      isUndefined(request.callRecordings) ? [] : [request.callRecordings],
    );

const fetchForPerson = (query: Mock, maxCount = 20) =>
  fetchCallRecordingsForRecord({
    client: { query },
    calendarEventTargetFieldName: 'targetPersonId',
    recordId: 'person',
    maxCount,
  });

describe('fetchCallRecordingsForRecord', () => {
  it('returns nothing without querying recordings when the record has no meetings', async () => {
    const query = vi
      .fn()
      .mockResolvedValueOnce(buildCalendarEventTargetConnection([]));

    await expect(fetchForPerson(query)).resolves.toEqual([]);
    expect(query).toHaveBeenCalledTimes(1);
  });

  it('finds listed recordings through the meetings that target the record', async () => {
    const query = vi
      .fn()
      .mockResolvedValueOnce(
        buildCalendarEventTargetConnection([
          'calendar-event-1',
          'calendar-event-2',
          'calendar-event-1',
          null,
        ]),
      )
      .mockResolvedValueOnce(
        buildCallRecordingConnection([
          { id: 'older', startedAt: '2026-01-01T10:00:00.000Z' },
          { id: 'newer', startedAt: '2026-02-01T10:00:00.000Z' },
        ]),
      );

    const callRecordings = await fetchCallRecordingsForRecord({
      client: { query },
      calendarEventTargetFieldName: 'targetCompanyId',
      recordId: 'company',
      maxCount: 20,
    });

    expect(callRecordings.map((callRecording) => callRecording.id)).toEqual([
      'newer',
      'older',
    ]);

    const targetQueryArguments =
      query.mock.calls[0][0].calendarEventTargets.__args;

    expect(targetQueryArguments.filter).toEqual({
      targetCompanyId: { eq: 'company' },
    });
    expect(targetQueryArguments.orderBy).toEqual([
      { calendarEvent: { startsAt: 'DescNullsLast' } },
    ]);

    const [callRecordingQuery] = getCallRecordingQueries(query);

    expect(callRecordingQuery.__args.filter).toEqual({
      calendarEventId: { in: ['calendar-event-1', 'calendar-event-2'] },
      status: { in: ['RECORDING', 'PROCESSING', 'COMPLETED'] },
    });
    expect(callRecordingQuery.edges.node.calendarEvent).toEqual({
      id: true,
      title: true,
      startsAt: true,
    });
  });

  it('reads every page of recordings so a live call without a start time is not cut', async () => {
    const startedRecordings = Array.from(
      { length: TWENTY_PAGE_SIZE },
      (_, recordingIndex) => ({
        id: `started-${recordingIndex}`,
        startedAt: new Date(
          Date.UTC(2026, 0, 1, 0, recordingIndex),
        ).toISOString(),
      }),
    );
    const query = vi
      .fn()
      .mockResolvedValueOnce(
        buildCalendarEventTargetConnection(['calendar-event-1']),
      )
      .mockResolvedValueOnce(
        buildCallRecordingConnection(startedRecordings, true),
      )
      .mockResolvedValueOnce(
        buildCallRecordingConnection([
          {
            id: 'live-call',
            startedAt: null,
            calendarEvent: {
              id: 'calendar-event-1',
              startsAt: '2026-06-01T10:00:00.000Z',
            },
          },
        ]),
      );

    const callRecordings = await fetchForPerson(query, 3);

    expect(callRecordings.map((callRecording) => callRecording.id)).toEqual([
      'live-call',
      `started-${TWENTY_PAGE_SIZE - 1}`,
      `started-${TWENTY_PAGE_SIZE - 2}`,
    ]);

    const callRecordingQueries = getCallRecordingQueries(query);

    expect(callRecordingQueries).toHaveLength(2);
    expect(callRecordingQueries[1].__args.after).toBe('next-recording-cursor');
  });

  it('keeps reading meetings past ones without recordings until enough are found', async () => {
    const upcomingMeetingIds = Array.from(
      { length: TWENTY_PAGE_SIZE },
      (_, calendarEventIndex) => `upcoming-${calendarEventIndex}`,
    );
    const query = vi
      .fn()
      .mockResolvedValueOnce(
        buildCalendarEventTargetConnection(upcomingMeetingIds, true),
      )
      .mockResolvedValueOnce(buildCallRecordingConnection([]))
      .mockResolvedValueOnce(
        buildCalendarEventTargetConnection(
          ['past-meeting', 'upcoming-0'],
          true,
        ),
      )
      .mockResolvedValueOnce(
        buildCallRecordingConnection([
          { id: 'recording', startedAt: '2026-01-01T10:00:00.000Z' },
        ]),
      );

    const callRecordings = await fetchForPerson(query, 1);

    expect(callRecordings.map((callRecording) => callRecording.id)).toEqual([
      'recording',
    ]);
    expect(query).toHaveBeenCalledTimes(4);
    expect(query.mock.calls[2][0].calendarEventTargets.__args.after).toBe(
      'next-target-cursor',
    );
    expect(
      getCallRecordingQueries(query)[1].__args.filter.calendarEventId,
    ).toEqual({ in: ['past-meeting'] });
  });

  it('stops reading meetings once the target page cap is reached', async () => {
    let targetPageIndex = 0;
    const query = vi.fn((request: QueryRequest) => {
      if (!isCalendarEventTargetQuery(request)) {
        return Promise.resolve(buildCallRecordingConnection([]));
      }

      targetPageIndex += 1;

      return Promise.resolve(
        buildCalendarEventTargetConnection(
          Array.from(
            { length: TWENTY_PAGE_SIZE },
            (_, calendarEventIndex) =>
              `calendar-event-${targetPageIndex}-${calendarEventIndex}`,
          ),
          true,
        ),
      );
    });

    await expect(fetchForPerson(query)).resolves.toEqual([]);
    expect(targetPageIndex).toBe(
      CALL_RECORDINGS_WIDGET_MAX_CALENDAR_EVENT_TARGET_PAGES,
    );
  });

  it('skips the meeting join when meetings could not be used to order targets', async () => {
    const query = vi
      .fn()
      .mockRejectedValueOnce(buildPermissionDeniedError())
      .mockResolvedValueOnce(
        buildCalendarEventTargetConnection(['calendar-event-1']),
      )
      .mockResolvedValueOnce(
        buildCallRecordingConnection([
          { id: 'recording', startedAt: '2026-01-01T10:00:00.000Z' },
        ]),
      );

    const callRecordings = await fetchForPerson(query);

    expect(callRecordings.map((callRecording) => callRecording.id)).toEqual([
      'recording',
    ]);
    expect(query).toHaveBeenCalledTimes(3);
    expect(query.mock.calls[1][0].calendarEventTargets.__args.orderBy).toEqual([
      { createdAt: 'DescNullsLast' },
    ]);

    const callRecordingQueries = getCallRecordingQueries(query);

    expect(callRecordingQueries).toHaveLength(1);
    expect(callRecordingQueries[0].edges.node.calendarEvent).toBeUndefined();
  });

  it('reads every meeting page when targets are ordered by creation date', async () => {
    const query = vi
      .fn()
      .mockRejectedValueOnce(buildPermissionDeniedError())
      .mockResolvedValueOnce(
        buildCalendarEventTargetConnection(['old-meeting'], true),
      )
      .mockResolvedValueOnce(
        buildCallRecordingConnection([
          { id: 'old-recording', startedAt: '2025-01-01T10:00:00.000Z' },
        ]),
      )
      .mockResolvedValueOnce(
        buildCalendarEventTargetConnection(['new-meeting']),
      )
      .mockResolvedValueOnce(
        buildCallRecordingConnection([
          { id: 'new-recording', startedAt: '2026-01-01T10:00:00.000Z' },
        ]),
      );

    const callRecordings = await fetchForPerson(query, 1);

    expect(callRecordings.map((callRecording) => callRecording.id)).toEqual([
      'new-recording',
    ]);
    expect(query).toHaveBeenCalledTimes(5);
  });

  it('lists recordings without their meeting when the join is denied', async () => {
    const query = vi
      .fn()
      .mockResolvedValueOnce(
        buildCalendarEventTargetConnection(['calendar-event-1']),
      )
      .mockRejectedValueOnce(buildPermissionDeniedError())
      .mockResolvedValueOnce(
        buildCallRecordingConnection([
          { id: 'recording', startedAt: '2026-01-01T10:00:00.000Z' },
        ]),
      );

    const callRecordings = await fetchForPerson(query);

    expect(callRecordings.map((callRecording) => callRecording.id)).toEqual([
      'recording',
    ]);
    expect(
      query.mock.calls[2][0].callRecordings.edges.node.calendarEvent,
    ).toBeUndefined();
  });

  it('fails when the recordings fallback query is denied too', async () => {
    const query = vi
      .fn()
      .mockResolvedValueOnce(
        buildCalendarEventTargetConnection(['calendar-event-1']),
      )
      .mockRejectedValueOnce(buildPermissionDeniedError())
      .mockRejectedValueOnce(buildPermissionDeniedError());

    await expect(fetchForPerson(query)).rejects.toThrow('Permission denied');
    expect(query).toHaveBeenCalledTimes(3);
  });

  it.each([
    ['target', [new Error('Network failure')]],
    [
      'recording',
      [
        buildCalendarEventTargetConnection(['calendar-event-1']),
        new Error('Network failure'),
      ],
    ],
  ])(
    'rethrows a %s query error that is not a permission error without retrying',
    async (_, responses) => {
      const query = vi.fn();

      for (const response of responses) {
        if (response instanceof Error) {
          query.mockRejectedValueOnce(response);
        } else {
          query.mockResolvedValueOnce(response);
        }
      }

      await expect(fetchForPerson(query)).rejects.toThrow('Network failure');
      expect(query).toHaveBeenCalledTimes(responses.length);
    },
  );
});
