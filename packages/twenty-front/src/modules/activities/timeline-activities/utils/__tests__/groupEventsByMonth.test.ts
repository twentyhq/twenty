import { type TimelineActivity } from '@/activities/timeline-activities/types/TimelineActivity';
import { groupEventsByMonth } from '@/activities/timeline-activities/utils/groupEventsByMonth';
import { CalendarSystem } from '@/localization/constants/CalendarSystem';
import { mockedTimelineActivityRecords } from '~/testing/mock-data/generated/data/timelineActivities/mock-timelineActivities-data';

const mockedTimelineActivities =
  mockedTimelineActivityRecords as unknown as TimelineActivity[];

const GREGORIAN_UTC = {
  timeZone: 'UTC',
  calendarSystem: CalendarSystem.GREGORIAN,
};

describe('groupEventsByMonth', () => {
  it('groups an event by when it happened rather than when it was persisted', () => {
    const [group] = groupEventsByMonth(
      [
        {
          createdAt: '2026-03-01T00:00:00.000Z',
          happensAt: '2026-02-01T00:00:00.000Z',
        } as TimelineActivity,
      ],
      GREGORIAN_UTC,
    );

    expect(group.month).toBe(2);
    expect(group.year).toBe(2026);
  });

  it('should group activities by month', () => {
    const grouped = groupEventsByMonth(mockedTimelineActivities, GREGORIAN_UTC);

    const totalItems = grouped.reduce(
      (sum, group) => sum + group.items.length,
      0,
    );
    expect(totalItems).toBe(mockedTimelineActivities.length);

    for (const group of grouped) {
      for (const item of group.items) {
        const date = new Date(item.happensAt);
        expect(date.getUTCMonth() + 1).toBe(group.month);
        expect(date.getUTCFullYear()).toBe(group.year);
      }
    }
  });

  it('should sort groups by most recent first', () => {
    const grouped = groupEventsByMonth(mockedTimelineActivities, GREGORIAN_UTC);

    for (let index = 1; index < grouped.length; index++) {
      const previous = grouped[index - 1];
      const current = grouped[index];
      const isPreviousMoreRecent =
        previous.year > current.year ||
        (previous.year === current.year && previous.month > current.month);
      expect(isPreviousMoreRecent).toBe(true);
    }
  });

  it('should group activities by month of the user calendar system and time zone', () => {
    const grouped = groupEventsByMonth(
      [
        { happensAt: '2026-09-22T12:00:00.000Z' } as TimelineActivity,
        { happensAt: '2026-09-22T21:00:00.000Z' } as TimelineActivity,
      ],
      { timeZone: 'Asia/Tehran', calendarSystem: CalendarSystem.PERSIAN },
    );

    expect(grouped.map(({ year, month }) => ({ year, month }))).toEqual([
      { year: 1405, month: 7 },
      { year: 1405, month: 6 },
    ]);
  });
});
