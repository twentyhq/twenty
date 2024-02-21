import { atom } from 'recoil';

import { Activity } from '@/activities/types/Activity';

export const activityInDrawerState = atom<Activity | null>({
  key: 'activityInDrawerState',
  default: null,
});
