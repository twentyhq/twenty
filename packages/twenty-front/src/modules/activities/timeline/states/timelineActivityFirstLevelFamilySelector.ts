import { atomFamily } from 'recoil';

import { Activity } from '@/activities/types/Activity';

export const timelineActivityWithoutTargetsFamilyState = atomFamily<
  Pick<Activity, 'id' | 'title' | 'createdAt' | 'author' | 'type'> | null,
  string
>({
  key: 'timelineActivityFirstLevelFamilySelector',
  default: null,
});
