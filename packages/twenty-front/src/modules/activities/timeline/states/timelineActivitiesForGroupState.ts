import { atom } from 'recoil';

import { ActivityForActivityGroup } from '@/activities/timeline/utils/groupActivitiesByMonth';

export const timelineActivitiesForGroupState = atom<ActivityForActivityGroup[]>(
  {
    key: 'timelineActivitiesForGroupState',
    default: [],
  },
);
