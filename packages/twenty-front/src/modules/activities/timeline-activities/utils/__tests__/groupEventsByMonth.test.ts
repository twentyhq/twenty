import { type TimelineActivity } from '@/activities/timeline-activities/types/TimelineActivity';
import { groupEventsByMonth } from '@/activities/timeline-activities/utils/groupEventsByMonth';
import { mockedTimelineActivityRecords } from '~/testing/mock-data/generated/data/timelineActivities/mock-timelineActivities-data';

const mockedTimelineActivities =
  mockedTimelineActivityRecords as unknown as TimelineActivity[];

describe('groupEventsByMonth', () => {
  it('groups an event by when it happened rather than when it was persisted', () => {
    const [group] = groupEventsByMonth([
      {
        createdAt: '2026-03-01T00:00:00.000Z',
        happensAt: '2026-02-01T00:00:00.000Z',
      } as TimelineActivity,
    ]);

    expect(group.month).toBe(1);
    expect(group.year).toBe(2026);
  });

  it('should group activities by month', () => {
    const grouped = groupEventsByMonth(mockedTimelineActivities);

    const totalItems = grouped.reduce(
      (sum, group) => sum + group.items.length,
      0,
    );
    expect(totalItems).toBe(mockedTimelineActivities.length);

    for (const group of grouped) {
      for (const item of group.items) {
        const date = new Date(item.happensAt);
        expect(date.getMonth()).toBe(group.month);
        expect(date.getFullYear()).toBe(group.year);
      }
    }
  });

  it('should sort groups by most recent first', () => {
    const grouped = groupEventsByMonth(mockedTimelineActivities);

    for (let index = 1; index < grouped.length; index++) {
      const previous = grouped[index - 1];
      const current = grouped[index];
      const isPreviousMoreRecent =
        previous.year > current.year ||
        (previous.year === current.year && previous.month > current.month);
      expect(isPreviousMoreRecent).toBe(true);
    }
  });
});
