import { beforeEach, describe, expect, it, vi } from 'vitest';

import { findTeamsCalendarEventIdsOrThrow } from 'src/features/transcripts/logic-functions/utils/find-teams-calendar-event-ids-or-throw';
import { getTeamsCalendarEventICalUIdOrThrow } from 'src/features/transcripts/logic-functions/utils/get-teams-calendar-event-ical-uid-or-throw';

vi.mock(
  'src/features/transcripts/logic-functions/utils/get-teams-calendar-event-ical-uid-or-throw',
  () => ({ getTeamsCalendarEventICalUIdOrThrow: vi.fn() }),
);

type AssociationNode = { eventExternalId: string; calendarEventId: string };

type QueryRequest = Record<
  string,
  {
    __args: {
      filter: Record<string, { in?: string[] }>;
      after?: string;
    };
  }
>;

const toConnection = <TNode>({
  nodes,
  endCursor,
}: {
  nodes: TNode[];
  endCursor?: string;
}) => ({
  edges: nodes.map((node) => ({ node })),
  pageInfo: {
    hasNextPage: endCursor !== undefined,
    endCursor: endCursor ?? null,
  },
});

describe('findTeamsCalendarEventIdsOrThrow', () => {
  beforeEach(() => {
    vi.mocked(getTeamsCalendarEventICalUIdOrThrow).mockReset();
  });

  it('ignores associations without an external ID or calendar event ID', async () => {
    const query = vi.fn().mockResolvedValue({
      calendarChannelEventAssociations: toConnection({
        nodes: [
          { eventExternalId: undefined, calendarEventId: 'unrelated' },
          { eventExternalId: 'external', calendarEventId: undefined },
          { eventExternalId: 'external', calendarEventId: 'calendar-event' },
        ],
      }),
    });

    await expect(
      findTeamsCalendarEventIdsOrThrow({
        accessToken: 'token',
        coreApiClient: { query },
        references: [{ eventExternalId: 'external' }],
      }),
    ).resolves.toEqual(new Map([['external', 'calendar-event']]));
    expect(getTeamsCalendarEventICalUIdOrThrow).not.toHaveBeenCalled();
  });

  it('uses the iCal fallback when an association has no calendar event ID', async () => {
    const query = vi
      .fn()
      .mockResolvedValueOnce({
        calendarChannelEventAssociations: toConnection({
          nodes: [{ eventExternalId: 'external', calendarEventId: null }],
        }),
      })
      .mockResolvedValueOnce({
        calendarEvents: toConnection({
          nodes: [{ id: 'calendar-event', iCalUid: 'ical-uid' }],
        }),
      });

    await expect(
      findTeamsCalendarEventIdsOrThrow({
        accessToken: 'token',
        coreApiClient: { query },
        references: [{ eventExternalId: 'external', iCalUId: 'ical-uid' }],
      }),
    ).resolves.toEqual(new Map([['external', 'calendar-event']]));
    expect(getTeamsCalendarEventICalUIdOrThrow).not.toHaveBeenCalled();
  });

  it('should not link a reference whose associations point to different events on different pages', async () => {
    vi.mocked(getTeamsCalendarEventICalUIdOrThrow).mockResolvedValue(
      'ical-series-master-1',
    );
    const query = vi.fn(async (request: QueryRequest) => {
      if ('calendarEvents' in request) {
        return { calendarEvents: toConnection({ nodes: [] }) };
      }

      return {
        calendarChannelEventAssociations: request
          .calendarChannelEventAssociations.__args.after
          ? toConnection<AssociationNode>({
              nodes: [
                {
                  eventExternalId: 'series-master-1',
                  calendarEventId: 'second-calendar-event',
                },
              ],
            })
          : toConnection<AssociationNode>({
              nodes: [
                {
                  eventExternalId: 'series-master-1',
                  calendarEventId: 'first-calendar-event',
                },
              ],
              endCursor: 'cursor-1',
            }),
      };
    });

    await expect(
      findTeamsCalendarEventIdsOrThrow({
        accessToken: 'token',
        coreApiClient: { query },
        references: [{ eventExternalId: 'series-master-1' }],
      }),
    ).resolves.toEqual(new Map());
    expect(query).toHaveBeenCalledWith({
      calendarChannelEventAssociations: expect.objectContaining({
        __args: expect.objectContaining({ after: 'cursor-1' }),
      }),
    });
    expect(getTeamsCalendarEventICalUIdOrThrow).toHaveBeenCalledWith({
      accessToken: 'token',
      eventId: 'series-master-1',
    });
  });

  it('should look up more than 200 references in batches and match references from every batch', async () => {
    const references = Array.from({ length: 201 }, (_, index) => ({
      eventExternalId: `event-${index}`,
    }));
    const query = vi.fn(async (request: QueryRequest) => ({
      calendarChannelEventAssociations: toConnection<AssociationNode>({
        nodes: (
          request.calendarChannelEventAssociations.__args.filter.eventExternalId
            .in ?? []
        ).map((eventExternalId) => ({
          eventExternalId,
          calendarEventId: `calendar-${eventExternalId}`,
        })),
      }),
    }));

    const calendarEventIds = await findTeamsCalendarEventIdsOrThrow({
      accessToken: 'token',
      coreApiClient: { query },
      references,
    });

    expect(
      query.mock.calls.map(
        ([request]) =>
          request.calendarChannelEventAssociations.__args.filter.eventExternalId
            .in?.length,
      ),
    ).toEqual([200, 1]);
    expect(calendarEventIds.size).toBe(201);
    expect(calendarEventIds.get('event-200')).toBe('calendar-event-200');
    expect(getTeamsCalendarEventICalUIdOrThrow).not.toHaveBeenCalled();
  });

  it('should read the iCalUIds of unassociated series masters a few at a time', async () => {
    let inFlightCount = 0;
    let maxInFlightCount = 0;

    vi.mocked(getTeamsCalendarEventICalUIdOrThrow).mockImplementation(
      async ({ eventId }) => {
        inFlightCount += 1;
        maxInFlightCount = Math.max(maxInFlightCount, inFlightCount);
        await new Promise((resolve) => setTimeout(resolve, 1));
        inFlightCount -= 1;

        return `ical-${eventId}`;
      },
    );
    const query = vi.fn(async (request: QueryRequest) =>
      'calendarEvents' in request
        ? { calendarEvents: toConnection({ nodes: [] }) }
        : {
            calendarChannelEventAssociations: toConnection<AssociationNode>({
              nodes: [],
            }),
          },
    );

    await findTeamsCalendarEventIdsOrThrow({
      accessToken: 'token',
      coreApiClient: { query },
      references: Array.from({ length: 10 }, (_, index) => ({
        eventExternalId: `series-master-${index}`,
      })),
    });

    expect(getTeamsCalendarEventICalUIdOrThrow).toHaveBeenCalledTimes(10);
    expect(maxInFlightCount).toBeGreaterThan(1);
    expect(maxInFlightCount).toBeLessThanOrEqual(4);
  });
});
