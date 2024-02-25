import { atom } from 'recoil';

export const timelineActivitiesNetworkingState = atom<{
  initialized: boolean;
  noActivities: boolean;
}>({
  key: 'timelineActivitiesNetworkingState',
  default: {
    initialized: false,
    noActivities: false,
  },
});
