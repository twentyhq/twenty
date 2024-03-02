import { atomFamily } from 'recoil';

import { Activity } from '@/activities/types/Activity';

export const timelineActivitiesFammilyState = atomFamily<
  Activity | null,
  string
>({
  key: 'timelineActivitiesFammilyState',
  default: null,
});
