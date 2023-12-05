import { ActivityForDrawer } from '@/activities/types/ActivityForDrawer';

export interface ActivityGroup {
  month: number;
  year: number;
  items: ActivityForDrawer[];
}

export const groupActivitiesByMonth = (activities: ActivityForDrawer[]) => {
  const acitivityGroups: ActivityGroup[] = [];
  for (const activity of activities) {
    const d = new Date(activity.createdAt);
    const month = d.getMonth();
    const year = d.getFullYear();

    const matchingGroup = acitivityGroups.find(
      (x) => x.year === year && x.month === month,
    );
    if (matchingGroup) {
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
