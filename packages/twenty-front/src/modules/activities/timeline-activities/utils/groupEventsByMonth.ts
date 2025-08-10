import { type TimelineActivity } from '@/activities/timeline-activities/types/TimelineActivity';
import { isDefined } from 'twenty-shared/utils';

export type EventGroup = {
  month: number;
  year: number;
  items: TimelineActivity[];
};

export const groupEventsByMonth = (events: TimelineActivity[]) => {
  const acitivityGroups: EventGroup[] = [];

  for (const event of events) {
    const d = new Date(event.createdAt);
    const month = d.getMonth();
    const year = d.getFullYear();

    const matchingGroup = acitivityGroups.find(
      (x) => x.year === year && x.month === month,
    );
    if (isDefined(matchingGroup)) {
      matchingGroup.items.push(event);
    } else {
      acitivityGroups.push({
        year,
        month,
        items: [event],
      });
    }
  }

  return acitivityGroups.sort((a, b) => b.year - a.year || b.month - a.month);
};
