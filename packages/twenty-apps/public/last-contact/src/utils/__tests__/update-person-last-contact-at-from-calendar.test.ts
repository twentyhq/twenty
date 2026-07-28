import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import type { CoreApiClient } from 'twenty-client-sdk/core';

import { updatePersonLastContactFromCalendar } from 'src/utils/update-person-last-contact-from-calendar';

const PERSON_ID = '11111111-1111-1111-1111-111111111111';
const MEMBER_ID = '33333333-3333-3333-3333-333333333333';
const CALENDAR_EVENT_ID = '44444444-4444-4444-4444-444444444444';
const NOW = '2026-06-12T12:00:00.000Z';
const PAST_EVENT_STARTS_AT = '2026-06-10T09:00:00.000Z';

const buildClient = (...queryResults: unknown[]) => {
  const queryMock = vi.fn();
  for (const queryResult of queryResults) {
    queryMock.mockResolvedValueOnce(queryResult);
  }
  const mutationMock = vi.fn().mockResolvedValue({ updatePeople: [{ id: 'updated' }] });
  const client = {
    query: queryMock,
    mutation: mutationMock,
  } as unknown as CoreApiClient;

  return { client, queryMock, mutationMock };
};

beforeEach(() => {
  vi.useFakeTimers();
  vi.setSystemTime(new Date(NOW));
});

afterEach(() => {
  vi.useRealTimers();
});

describe('updatePersonLastContactAtFromCalendar', () => {
  it('should query the latest past non-canceled event for the person', async () => {
    const { client, queryMock } = buildClient({
      calendarEventParticipants: { edges: [] },
    });

    await updatePersonLastContactFromCalendar(client, PERSON_ID);

    expect(queryMock).toHaveBeenCalledWith({
      calendarEventParticipants: {
        __args: {
          filter: {
            personId: { eq: PERSON_ID },
            calendarEvent: {
              startsAt: { lte: NOW },
              isCanceled: { eq: false },
            },
          },
          orderBy: [{ calendarEvent: { startsAt: 'DescNullsLast' } }],
          first: 1,
        },
        edges: {
          node: {
            id: true,
            calendarEvent: {
              id: true,
              startsAt: true,
            },
          },
        },
      },
    });
  });

  it('sets lastContactAt, organizer member and the calendarEvent item', async () => {
    const { client, queryMock, mutationMock } = buildClient(
      {
        calendarEventParticipants: {
          edges: [
            {
              node: {
                id: 'participant-1',
                calendarEvent: {
                  id: CALENDAR_EVENT_ID,
                  startsAt: PAST_EVENT_STARTS_AT,
                },
              },
            },
          ],
        },
      },
      {
        calendarEventParticipants: {
          edges: [
            {
              node: {
                isOrganizer: false,
                workspaceMemberId: '55555555-5555-5555-5555-555555555555',
              },
            },
            { node: { isOrganizer: true, workspaceMemberId: MEMBER_ID } },
          ],
        },
      },
      { person: null },
    );

    await updatePersonLastContactFromCalendar(client, PERSON_ID);

    expect(queryMock).toHaveBeenNthCalledWith(2, {
      calendarEventParticipants: {
        __args: {
          filter: {
            calendarEventId: { eq: CALENDAR_EVENT_ID },
            workspaceMemberId: { is: 'NOT_NULL' },
          },
          first: 200,
        },
        edges: {
          node: {
            isOrganizer: true,
            workspaceMemberId: true,
          },
        },
      },
    });

    const data = mutationMock.mock.calls[0][0].updatePeople.__args.data;
    expect(data).toEqual({
      lastContactAt: PAST_EVENT_STARTS_AT,
      lastContactById: MEMBER_ID,
      lastContactItemCalendarEventId: CALENDAR_EVENT_ID,
      lastContactItemMessageId: null,
      lastOutboundAt: PAST_EVENT_STARTS_AT,
      lastInboundAt: PAST_EVENT_STARTS_AT,
      lastMeetingId: CALENDAR_EVENT_ID,
    });
  });

  it('should not update the person when they have no past events', async () => {
    const { client, mutationMock } = buildClient({
      calendarEventParticipants: { edges: [] },
    });

    await updatePersonLastContactFromCalendar(client, PERSON_ID);

    expect(mutationMock).not.toHaveBeenCalled();
  });
});
