import { Activity } from '@/activities/types/Activity';
import { isDefined } from '~/utils/isDefined';

export type ActivityForActivityGroup = Pick<Activity, 'id' | 'createdAt'>;

export type ActivityGroup = {
  month: number;
  year: number;
  items: ActivityForActivityGroup[];
};

export const groupActivitiesByMonth = (
  activities: ActivityForActivityGroup[],
) => {
  const acitivityGroups: ActivityGroup[] = [];

  for (const activity of activities) {
    const d = new Date(activity.createdAt);
    const month = d.getMonth();
    const year = d.getFullYear();

    const matchingGroup = acitivityGroups.find(
      (x) => x.year === year && x.month === month,
    );
    if (isDefined(matchingGroup)) {
      matchingGroup.items.push(activity);
    } else {
      acitivityGroups.push({
        year,
        month,
        items: [activity],
      });
    }
  }

  return acitivityGroups.sort((a, b) => b.year - a.year || b.month - a.month);
};
