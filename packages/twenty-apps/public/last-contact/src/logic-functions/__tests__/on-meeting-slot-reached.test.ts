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

import onMeetingSlotReached from '../on-meeting-slot-reached';

const SLOT_START = '2026-06-12T15:00:00.000Z';
const SLOT_END = '2026-06-12T15:15:00.000Z';

const handler = onMeetingSlotReached.config.handler as (payload: {
  slotStart: string;
  slotEnd: string;
}) => Promise<void>;

beforeEach(() => {
  queryMock.mockReset();
  mutationMock.mockReset();
});

describe('on-meeting-slot-reached', () => {
  it('should be valid and have no trigger of its own', () => {
    expect(onMeetingSlotReached.success).toBe(true);
    expect(onMeetingSlotReached.config.cronTriggerSettings).toBeUndefined();
    expect(
      onMeetingSlotReached.config.databaseEventTriggerSettings,
    ).toBeUndefined();
  });

  it('should re-read the person meetings of its slot in one call and stop when none remain', async () => {
    queryMock.mockResolvedValue({
      calendarEventParticipants: {
        edges: [],
        pageInfo: { hasNextPage: false, endCursor: null },
      },
    });

    await handler({ slotStart: SLOT_START, slotEnd: SLOT_END });

    expect(queryMock).toHaveBeenCalledTimes(1);
    expect(
      queryMock.mock.calls[0][0].calendarEventParticipants.__args.filter,
    ).toEqual({
      and: [
        { personId: { is: 'NOT_NULL' } },
        { calendarEvent: { startsAt: { gte: SLOT_START } } },
        { calendarEvent: { startsAt: { lt: SLOT_END } } },
        { calendarEvent: { isCanceled: { eq: false } } },
      ],
    });
    expect(mutationMock).not.toHaveBeenCalled();
  });
});
