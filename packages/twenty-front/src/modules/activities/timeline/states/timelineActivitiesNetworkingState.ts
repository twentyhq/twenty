import { createState } from '@/ui/utilities/state/utils/createState';

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
