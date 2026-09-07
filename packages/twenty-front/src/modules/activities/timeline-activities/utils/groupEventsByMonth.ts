import { type TimelineActivity } from '@/activities/timeline-activities/types/TimelineActivity';
import { isDefined } from 'twenty-shared/utils';

export type EventGroup = {
  month: number;
  year: number;
  items: TimelineActivity[];
};

export const groupEventsByMonth = (events: TimelineActivity[]) => {
  const activityGroups: EventGroup[] = [];

  for (const event of events) {
    const date = new Date(event.happensAt);
    const month = date.getMonth();
    const year = date.getFullYear();

    const matchingGroup = activityGroups.find(
      (group) => group.year === year && group.month === month,
    );
    if (isDefined(matchingGroup)) {
      matchingGroup.items.push(event);
    } else {
      activityGroups.push({
        year,
        month,
        items: [event],
      });
    }
  }

  return activityGroups.sort((a, b) => b.year - a.year || b.month - a.month);
};
