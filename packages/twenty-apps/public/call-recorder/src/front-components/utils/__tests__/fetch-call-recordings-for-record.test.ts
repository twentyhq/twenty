import { describe, expect, it, vi } from 'vitest';

import { CALL_RECORDINGS_WIDGET_MAX_CALENDAR_EVENT_TARGETS } from 'src/front-components/constants/call-recordings-widget-max-calendar-event-targets.constant';
import { fetchCallRecordingsForRecord } from 'src/front-components/utils/fetch-call-recordings-for-record.util';
import { TWENTY_PAGE_SIZE } from 'src/logic-functions/constants/twenty-page-size';

const buildCalendarEventTargetConnection = (
  calendarEventIds: Array<string | null>,
  hasNextPage = false,
) => ({
  calendarEventTargets: {
    pageInfo: {
      hasNextPage,
      endCursor: hasNextPage ? 'next-cursor' : null,
    },
    edges: calendarEventIds.map((calendarEventId, targetIndex) => ({
      node: { id: `target-${targetIndex}`, calendarEventId },
    })),
  },
});

const buildCallRecordingConnection = (
  callRecordings: Array<{ id: string; startedAt: string }>,
) => ({
  callRecordings: {
    edges: callRecordings.map((callRecording) => ({ node: callRecording })),
  },
});

describe('fetchCallRecordingsForRecord', () => {
  it('returns nothing without querying recordings when the record has no meetings', async () => {
    const query = vi
      .fn()
      .mockResolvedValueOnce(buildCalendarEventTargetConnection([]));

    await expect(
      fetchCallRecordingsForRecord({ query } as never, {
        calendarEventTargetFieldName: 'targetPersonId',
        recordId: 'person',
        maxCount: 20,
      }),
    ).resolves.toEqual([]);
    expect(query).toHaveBeenCalledTimes(1);
  });

  it('finds recordings through the meetings that target the record', async () => {
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

    const callRecordings = await fetchCallRecordingsForRecord(
      { query } as never,
      {
        calendarEventTargetFieldName: 'targetCompanyId',
        recordId: 'company',
        maxCount: 20,
      },
    );

    expect(callRecordings.map((callRecording) => callRecording.id)).toEqual([
      'newer',
      'older',
    ]);
    expect(query.mock.calls[0][0].calendarEventTargets.__args.filter).toEqual({
      targetCompanyId: { eq: 'company' },
    });
    expect(query.mock.calls[0][0].calendarEventTargets.__args.orderBy).toEqual([
      { calendarEvent: { startsAt: 'DescNullsLast' } },
    ]);

    const callRecordingQueryArguments =
      query.mock.calls[1][0].callRecordings.__args;

    expect(callRecordingQueryArguments.filter).toEqual({
      calendarEventId: { in: ['calendar-event-1', 'calendar-event-2'] },
      status: { in: ['RECORDING', 'PROCESSING', 'COMPLETED'] },
    });
    expect(
      query.mock.calls[1][0].callRecordings.edges.node.calendarEvent,
    ).toBeDefined();
    expect(callRecordingQueryArguments.first).toBe(20);
    expect(callRecordingQueryArguments.orderBy).toEqual([
      { startedAt: 'DescNullsLast' },
      { createdAt: 'DescNullsLast' },
    ]);
  });

  it('merges batches of meetings and keeps only the most recent recordings', async () => {
    const calendarEventIds = Array.from(
      { length: TWENTY_PAGE_SIZE + 1 },
      (_, calendarEventIndex) => `calendar-event-${calendarEventIndex}`,
    );
    const query = vi
      .fn()
      .mockResolvedValueOnce(
        buildCalendarEventTargetConnection(calendarEventIds),
      )
      .mockResolvedValueOnce(
        buildCallRecordingConnection([
          { id: 'first-batch-newest', startedAt: '2026-03-01T10:00:00.000Z' },
          { id: 'first-batch-oldest', startedAt: '2026-01-01T10:00:00.000Z' },
        ]),
      )
      .mockResolvedValueOnce(
        buildCallRecordingConnection([
          { id: 'second-batch', startedAt: '2026-02-01T10:00:00.000Z' },
        ]),
      );

    const callRecordings = await fetchCallRecordingsForRecord(
      { query } as never,
      {
        calendarEventTargetFieldName: 'targetOpportunityId',
        recordId: 'opportunity',
        maxCount: 2,
      },
    );

    expect(callRecordings.map((callRecording) => callRecording.id)).toEqual([
      'first-batch-newest',
      'second-batch',
    ]);
    expect(query).toHaveBeenCalledTimes(3);
    expect(
      query.mock.calls[2][0].callRecordings.__args.filter.calendarEventId.in,
    ).toEqual([`calendar-event-${TWENTY_PAGE_SIZE}`]);
  });

  it('stops reading meetings once the target cap is reached', async () => {
    const fullPage = Array.from(
      { length: TWENTY_PAGE_SIZE },
      (_, calendarEventIndex) => `calendar-event-${calendarEventIndex}`,
    );
    const query = vi.fn((request: Record<string, unknown>) =>
      Promise.resolve(
        'calendarEventTargets' in request
          ? buildCalendarEventTargetConnection(fullPage, true)
          : buildCallRecordingConnection([]),
      ),
    );

    await fetchCallRecordingsForRecord({ query } as never, {
      calendarEventTargetFieldName: 'targetPersonId',
      recordId: 'person',
      maxCount: 20,
    });

    const calendarEventTargetQueryCount = query.mock.calls.filter(
      ([request]) => 'calendarEventTargets' in request,
    ).length;

    expect(calendarEventTargetQueryCount).toBe(
      CALL_RECORDINGS_WIDGET_MAX_CALENDAR_EVENT_TARGETS / TWENTY_PAGE_SIZE,
    );
  });

  it('falls back to target creation order when meetings cannot be used for ordering', async () => {
    const query = vi
      .fn()
      .mockRejectedValueOnce(new Error('Forbidden'))
      .mockResolvedValueOnce(
        buildCalendarEventTargetConnection(['calendar-event-1']),
      )
      .mockResolvedValueOnce(
        buildCallRecordingConnection([
          { id: 'recording', startedAt: '2026-01-01T10:00:00.000Z' },
        ]),
      );

    const callRecordings = await fetchCallRecordingsForRecord(
      { query } as never,
      {
        calendarEventTargetFieldName: 'targetPersonId',
        recordId: 'person',
        maxCount: 20,
      },
    );

    expect(callRecordings.map((callRecording) => callRecording.id)).toEqual([
      'recording',
    ]);
    expect(query.mock.calls[1][0].calendarEventTargets.__args.orderBy).toEqual([
      { createdAt: 'DescNullsLast' },
    ]);
  });

  it('lists recordings without their meeting when meetings cannot be read', async () => {
    const query = vi
      .fn()
      .mockResolvedValueOnce(
        buildCalendarEventTargetConnection(['calendar-event-1']),
      )
      .mockRejectedValueOnce(new Error('Forbidden'))
      .mockResolvedValueOnce(
        buildCallRecordingConnection([
          { id: 'recording', startedAt: '2026-01-01T10:00:00.000Z' },
        ]),
      );

    const callRecordings = await fetchCallRecordingsForRecord(
      { query } as never,
      {
        calendarEventTargetFieldName: 'targetPersonId',
        recordId: 'person',
        maxCount: 20,
      },
    );

    expect(callRecordings.map((callRecording) => callRecording.id)).toEqual([
      'recording',
    ]);
    expect(
      query.mock.calls[2][0].callRecordings.edges.node.calendarEvent,
    ).toBeUndefined();
  });

  it('fails when the recordings fallback query fails too', async () => {
    const query = vi
      .fn()
      .mockResolvedValueOnce(
        buildCalendarEventTargetConnection(['calendar-event-1']),
      )
      .mockRejectedValueOnce(new Error('Forbidden'))
      .mockRejectedValueOnce(new Error('Forbidden'));

    await expect(
      fetchCallRecordingsForRecord({ query } as never, {
        calendarEventTargetFieldName: 'targetPersonId',
        recordId: 'person',
        maxCount: 20,
      }),
    ).rejects.toThrow('Forbidden');
    expect(query).toHaveBeenCalledTimes(3);
  });
});
