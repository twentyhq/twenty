import { beforeEach, describe, expect, it, vi } from 'vitest';
import { CoreApiClient } from 'twenty-client-sdk/core';

import { fetchCalendarEventParticipantWorkspaceMemberIds } from 'src/logic-functions/data/fetch-calendar-event-participant-workspace-member-ids.util';

const queryMock = vi.fn();

const CLIENT: CoreApiClient = Object.assign(
  Object.create(CoreApiClient.prototype),
  {
    query: queryMock,
    mutation: vi.fn(),
  },
);

type ParticipantNode = {
  calendarEventId: string | null;
  workspaceMemberId: string | null;
};

const buildPage = (
  participants: ParticipantNode[],
  { hasNextPage = false, endCursor = null as string | null } = {},
) => ({
  calendarEventParticipants: {
    pageInfo: { hasNextPage, endCursor },
    edges: participants.map((participant) => ({ node: participant })),
  },
});

describe('fetchCalendarEventParticipantWorkspaceMemberIds', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('returns an empty map without querying when no event ids are given', async () => {
    const result = await fetchCalendarEventParticipantWorkspaceMemberIds(
      CLIENT,
      [],
    );

    expect(result.size).toBe(0);
    expect(queryMock).not.toHaveBeenCalled();
  });

  it('filters participants to the given events and to matched workspace members', async () => {
    queryMock.mockResolvedValue(buildPage([]));

    await fetchCalendarEventParticipantWorkspaceMemberIds(CLIENT, [
      'calendar-event-1',
      'calendar-event-2',
    ]);

    expect(queryMock).toHaveBeenCalledWith(
      expect.objectContaining({
        calendarEventParticipants: expect.objectContaining({
          __args: expect.objectContaining({
            filter: {
              calendarEventId: { in: ['calendar-event-1', 'calendar-event-2'] },
              workspaceMemberId: { is: 'NOT_NULL' },
            },
          }),
        }),
      }),
    );
  });

  it('groups unique member ids by event across pages and skips unmatched participants', async () => {
    queryMock
      .mockResolvedValueOnce(
        buildPage(
          [
            { calendarEventId: 'calendar-event-1', workspaceMemberId: 'member-1' },
            { calendarEventId: 'calendar-event-1', workspaceMemberId: null },
          ],
          { hasNextPage: true, endCursor: 'cursor-1' },
        ),
      )
      .mockResolvedValueOnce(
        buildPage([
          { calendarEventId: 'calendar-event-1', workspaceMemberId: 'member-1' },
          { calendarEventId: 'calendar-event-1', workspaceMemberId: 'member-2' },
          { calendarEventId: 'calendar-event-2', workspaceMemberId: 'member-2' },
          { calendarEventId: null, workspaceMemberId: 'member-3' },
        ]),
      );

    const result = await fetchCalendarEventParticipantWorkspaceMemberIds(
      CLIENT,
      ['calendar-event-1', 'calendar-event-2', 'calendar-event-3'],
    );

    expect(queryMock).toHaveBeenCalledTimes(2);
    expect(result.get('calendar-event-1')).toEqual(['member-1', 'member-2']);
    expect(result.get('calendar-event-2')).toEqual(['member-2']);
    expect(result.has('calendar-event-3')).toBe(false);
  });
});
