import { describe, expect, it, vi } from 'vitest';

import { fetchCallParticipants } from 'src/front-components/utils/fetch-call-participants.util';

const buildCallRecordingConnection = (
  callRecording: { id: string; calendarEventId: string | null } | undefined,
) => ({
  callRecordings: {
    edges: callRecording === undefined ? [] : [{ node: callRecording }],
  },
});

const buildParticipantConnection = (
  participantIds: string[],
  hasNextPage = false,
) => ({
  calendarEventParticipants: {
    pageInfo: {
      hasNextPage,
      endCursor: hasNextPage ? 'next-cursor' : null,
    },
    edges: participantIds.map((participantId) => ({
      node: { id: participantId, calendarEventId: 'calendar-event' },
    })),
  },
});

describe('fetchCallParticipants', () => {
  it('reports a missing recording', async () => {
    const query = vi
      .fn()
      .mockResolvedValueOnce(buildCallRecordingConnection(undefined));

    await expect(
      fetchCallParticipants({ query } as never, {
        callRecordingId: 'call-recording',
      }),
    ).resolves.toEqual({ kind: 'callRecordingNotFound' });
    expect(query).toHaveBeenCalledTimes(1);
  });

  it('reports a recording without a meeting without querying participants', async () => {
    const query = vi.fn().mockResolvedValueOnce(
      buildCallRecordingConnection({
        id: 'call-recording',
        calendarEventId: null,
      }),
    );

    await expect(
      fetchCallParticipants({ query } as never, {
        callRecordingId: 'call-recording',
      }),
    ).resolves.toEqual({ kind: 'notLinkedToMeeting' });
    expect(query).toHaveBeenCalledTimes(1);
  });

  it('reads participants flat by calendar event id across pages', async () => {
    const query = vi
      .fn()
      .mockResolvedValueOnce(
        buildCallRecordingConnection({
          id: 'call-recording',
          calendarEventId: 'calendar-event',
        }),
      )
      .mockResolvedValueOnce(
        buildParticipantConnection(['participant-1'], true),
      )
      .mockResolvedValueOnce(buildParticipantConnection(['participant-2']));

    const result = await fetchCallParticipants({ query } as never, {
      callRecordingId: 'call-recording',
    });

    expect(result).toEqual({
      kind: 'loaded',
      participants: [
        { id: 'participant-1', calendarEventId: 'calendar-event' },
        { id: 'participant-2', calendarEventId: 'calendar-event' },
      ],
    });

    expect(query.mock.calls[0][0].callRecordings.__args.filter).toEqual({
      id: { eq: 'call-recording' },
    });

    const firstParticipantQuery = query.mock.calls[1][0];

    expect(firstParticipantQuery.callRecordings).toBeUndefined();
    expect(
      firstParticipantQuery.calendarEventParticipants.__args.filter,
    ).toEqual({ calendarEventId: { eq: 'calendar-event' } });
    expect(
      firstParticipantQuery.calendarEventParticipants.edges.node.person,
    ).toBeDefined();
    expect(query.mock.calls[2][0].calendarEventParticipants.__args.after).toBe(
      'next-cursor',
    );
  });
});
