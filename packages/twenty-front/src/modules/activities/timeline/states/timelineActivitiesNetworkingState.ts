import { createState } from 'twenty-ui';

export const timelineActivitiesNetworkingState = createState<{
  initialized: boolean;
  noActivities: boolean;
}>({
  key: 'timelineActivitiesNetworkingState',
  defaultValue: {
    initialized: false,
    noActivities: false,
  },
});
