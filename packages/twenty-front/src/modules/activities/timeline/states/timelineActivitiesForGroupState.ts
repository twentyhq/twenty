import { createState } from 'twenty-ui';

import { ActivityForActivityGroup } from '@/activities/timeline/utils/groupActivitiesByMonth';

export const timelineActivitiesForGroupState = createState<
  ActivityForActivityGroup[]
>({
  key: 'timelineActivitiesForGroupState',
  defaultValue: [],
});
