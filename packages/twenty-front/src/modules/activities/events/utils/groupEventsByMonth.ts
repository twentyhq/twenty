import { Event } from '@/activities/events/types/Event';
import { isDefined } from '~/utils/isDefined';

export type EventGroup = {
  month: number;
  year: number;
  items: Event[];
};

export const groupEventsByMonth = (events: Event[]) => {
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
