import { useMemo } from 'react';

import { type TimelineActivity } from '@/activities/timeline-activities/types/TimelineActivity';

type HeatmapDayData = {
  day: string;
  value: number;
};

export const useActivityHeatmapData = (
  timelineActivities: TimelineActivity[],
) => {
  return useMemo(() => {
    const countsByDay = new Map<string, number>();

    for (const activity of timelineActivities) {
      const day = activity.createdAt.substring(0, 10);
      countsByDay.set(day, (countsByDay.get(day) ?? 0) + 1);
    }

    const data: HeatmapDayData[] = [];

    for (const [day, value] of countsByDay) {
      data.push({ day, value });
    }

    const now = new Date();
    const oneYearAgo = new Date(now);
    oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1);

    const from = oneYearAgo.toISOString().substring(0, 10);
    const to = now.toISOString().substring(0, 10);

    return { data, from, to };
  }, [timelineActivities]);
};
