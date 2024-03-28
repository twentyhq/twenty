import { ActivityForActivityGroup } from '@/activities/timeline/utils/groupActivitiesByMonth';
import { createState } from '@/ui/utilities/state/utils/createState';

export const timelineActivitiesForGroupState = createState<
  ActivityForActivityGroup[]
>({
  key: 'timelineActivitiesForGroupState',
  defaultValue: [],
});
