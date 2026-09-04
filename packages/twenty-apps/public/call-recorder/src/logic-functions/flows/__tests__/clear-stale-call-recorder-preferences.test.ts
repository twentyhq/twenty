import { beforeEach, describe, expect, it, vi } from 'vitest';

import { clearStaleCallRecorderPreferences } from 'src/logic-functions/flows/clear-stale-call-recorder-preferences.util';

const NOW = new Date('2026-01-01T12:00:00.000Z');

const buildConnection = <TNode>(nodes: TNode[]) => ({
  pageInfo: { hasNextPage: false, endCursor: null },
  edges: nodes.map((node) => ({ node })),
});

const queryMock = vi.fn();
const mutationMock = vi.fn();
const client = { query: queryMock, mutation: mutationMock } as never;

describe('clearStaleCallRecorderPreferences', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mutationMock.mockImplementation(async (mutationArgument: any) => ({
      updateCalendarEvents:
        mutationArgument.updateCalendarEvents.__args.filter.id.in.map(
          (id: string) => ({ id }),
        ),
    }));
  });

  it('clears ended default-ON events the recorder never attempted', async () => {
    queryMock.mockImplementation(async (queryArgument: any) => {
      if (queryArgument.calendarEvents !== undefined) {
        expect(queryArgument.calendarEvents.__args.filter).toEqual({
          callRecorderPreference: { eq: 'ON' },
          or: [
            { endsAt: { lte: NOW.toISOString() } },
            {
              and: [
                { endsAt: { is: 'NULL' } },
                { startsAt: { lte: NOW.toISOString() } },
              ],
            },
          ],
        });

        return {
          calendarEvents: buildConnection([
            { id: 'calendar-event-recorded' },
            { id: 'calendar-event-canceled' },
            { id: 'calendar-event-never-attempted' },
          ]),
        };
      }

      return {
        callRecordings: buildConnection([
          {
            id: 'call-recording-recorded',
            calendarEventId: 'calendar-event-recorded',
            recordingRequestStatus: 'REQUESTED',
            status: 'COMPLETED',
          },
          {
            id: 'call-recording-canceled',
            calendarEventId: 'calendar-event-canceled',
            recordingRequestStatus: 'CANCELED',
            status: 'SCHEDULED',
          },
        ]),
      };
    });

    const result = await clearStaleCallRecorderPreferences({
      client,
      now: NOW,
    });

    expect(mutationMock).toHaveBeenCalledExactlyOnceWith(
      expect.objectContaining({
        updateCalendarEvents: expect.objectContaining({
          __args: {
            filter: {
              id: {
                in: [
                  'calendar-event-canceled',
                  'calendar-event-never-attempted',
                ],
              },
              callRecorderPreference: { eq: 'ON' },
            },
            data: { callRecorderPreference: null },
          },
        }),
      }),
    );
    expect(result).toEqual({
      endedCalendarEventCount: 3,
      clearedCalendarEventCount: 2,
    });
  });

  it('does nothing when no ended event carries the default', async () => {
    queryMock.mockResolvedValue({ calendarEvents: buildConnection([]) });

    const result = await clearStaleCallRecorderPreferences({
      client,
      now: NOW,
    });

    expect(mutationMock).not.toHaveBeenCalled();
    expect(result).toEqual({
      endedCalendarEventCount: 0,
      clearedCalendarEventCount: 0,
    });
  });
});
