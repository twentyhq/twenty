import { beforeEach, describe, expect, it, vi } from 'vitest';

const { queryMock, mutationMock } = vi.hoisted(() => ({
  queryMock: vi.fn(),
  mutationMock: vi.fn(),
}));
vi.mock('twenty-client-sdk/core', () => ({
  CoreApiClient: vi.fn(function () {
    return { query: queryMock, mutation: mutationMock };
  }),
}));

import onCalendarInteraction from '../on-calendar-interaction';

const PERSON_ID = '11111111-1111-1111-1111-111111111111';
const PAST_EVENT_STARTS_AT = '2026-06-10T09:00:00.000Z';

const handler = onCalendarInteraction.config.handler as (
  event: unknown,
) => Promise<void>;

const buildEvent = (personId: string | null) => ({
  recordId: 'participant-1',
  properties: {
    updatedFields: ['personId'],
    after: { id: 'participant-1', personId },
  },
});

beforeEach(() => {
  queryMock.mockReset();
  mutationMock.mockReset();
  mutationMock.mockResolvedValue({ updatePeople: [{ id: 'updated' }] });
});

describe('on-calendar-interaction definition', () => {
  it('should be valid and only trigger on personId updates', () => {
    expect(onCalendarInteraction.success).toBe(true);
    expect(onCalendarInteraction.config.databaseEventTriggerSettings).toEqual({
      eventName: 'calendarEventParticipant.updated',
      updatedFields: ['personId'],
    });
  });
});

describe('on-calendar-interaction handler', () => {
  it('should update the person from the event payload without re-querying the participant', async () => {
    queryMock
      .mockResolvedValueOnce({
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
      })
      .mockResolvedValueOnce({
        calendarEventParticipants: { edges: [] },
      })
      .mockResolvedValueOnce({ person: null })
      .mockResolvedValueOnce({ person: null });

    await handler(buildEvent(PERSON_ID));

    expect(queryMock).toHaveBeenCalledTimes(4);
    const queryArgs = queryMock.mock.calls[0][0];
    expect(queryArgs.calendarEventParticipants.__args.filter.personId).toEqual(
      { eq: PERSON_ID },
    );
    expect(
      mutationMock.mock.calls.filter(([mutation]) => mutation.updatePeople),
    ).toHaveLength(1);
    const mutationArgs = mutationMock.mock.calls[0][0];
    expect(mutationArgs.updatePeople.__args.data).toEqual({
      lastContactAt: PAST_EVENT_STARTS_AT,
      lastContactById: null,
      lastContactItemCalendarEventId: 'event-1',
      lastContactItemMessageId: null,
      lastOutboundAt: PAST_EVENT_STARTS_AT,
      lastInboundAt: PAST_EVENT_STARTS_AT,
      lastMeetingId: 'event-1',
    });
  });

  it('should do nothing when the participant has no personId', async () => {
    await handler(buildEvent(null));

    expect(queryMock).not.toHaveBeenCalled();
    expect(mutationMock).not.toHaveBeenCalled();
  });
});
