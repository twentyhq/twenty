import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import type { CoreApiClient } from 'twenty-client-sdk/core';

import { updatePersonLastContactAtFromCalendar } from 'src/utils/update-person-last-contact-at-from-calendar';

const PERSON_ID = '11111111-1111-1111-1111-111111111111';
const NOW = '2026-06-12T12:00:00.000Z';
const PAST_EVENT_STARTS_AT = '2026-06-10T09:00:00.000Z';

const buildClient = (queryResult: unknown) => {
  const queryMock = vi.fn().mockResolvedValue(queryResult);
  const mutationMock = vi.fn().mockResolvedValue({ updatePeople: [] });
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
  it('should filter on past non-canceled events in the query and only fetch the latest one', async () => {
    const { client, queryMock } = buildClient({
      calendarEventParticipants: { edges: [] },
    });

    await updatePersonLastContactAtFromCalendar(client, PERSON_ID);

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

  it('should update the person with the latest past event startsAt', async () => {
    const { client, mutationMock } = buildClient({
      calendarEventParticipants: {
        edges: [
          {
            node: {
              id: 'participant-1',
              calendarEvent: {
                id: 'event-1',
                startsAt: PAST_EVENT_STARTS_AT,
              },
            },
          },
        ],
      },
    });

    await updatePersonLastContactAtFromCalendar(client, PERSON_ID);

    expect(mutationMock).toHaveBeenCalledTimes(1);
    const mutationArgs = mutationMock.mock.calls[0][0];
    expect(mutationArgs.updatePeople.__args.data).toEqual({
      lastContactAt: PAST_EVENT_STARTS_AT,
    });
  });

  it('should not update the person when they have no past events', async () => {
    const { client, mutationMock } = buildClient({
      calendarEventParticipants: { edges: [] },
    });

    await updatePersonLastContactAtFromCalendar(client, PERSON_ID);

    expect(mutationMock).not.toHaveBeenCalled();
  });
});
