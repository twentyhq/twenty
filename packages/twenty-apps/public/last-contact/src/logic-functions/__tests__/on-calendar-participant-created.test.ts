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

import onCalendarParticipantCreated from '../on-calendar-participant-created';

const PERSON_ID = '11111111-1111-1111-1111-111111111111';
const PAST_EVENT_STARTS_AT = '2026-06-10T09:00:00.000Z';

const handler = onCalendarParticipantCreated.config.handler as (
  event: unknown,
) => Promise<void>;

const buildEvent = (personId: string | null) => ({
  recordId: 'participant-1',
  properties: {
    after: { id: 'participant-1', personId },
  },
});

beforeEach(() => {
  queryMock.mockReset();
  mutationMock.mockReset();
  mutationMock.mockResolvedValue({ updatePeople: [{ id: 'updated' }] });
});

describe('on-calendar-participant-created definition', () => {
  it('should be valid and trigger on participant creation', () => {
    expect(onCalendarParticipantCreated.success).toBe(true);
    expect(
      onCalendarParticipantCreated.config.databaseEventTriggerSettings,
    ).toEqual({
      eventName: 'calendarEventParticipant.created',
    });
  });
});

describe('on-calendar-participant-created handler', () => {
  it('should update the person when the participant is created already linked', async () => {
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
      .mockResolvedValueOnce({ calendarEventParticipants: { edges: [] } })
      .mockResolvedValueOnce({ person: null })
      .mockResolvedValueOnce({ person: null });

    await handler(buildEvent(PERSON_ID));

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

  it('should do nothing when the participant is created unmatched', async () => {
    await handler(buildEvent(null));

    expect(queryMock).not.toHaveBeenCalled();
    expect(mutationMock).not.toHaveBeenCalled();
  });
});
