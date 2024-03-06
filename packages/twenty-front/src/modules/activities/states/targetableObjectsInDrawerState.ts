import { atom } from 'recoil';

import { ActivityTargetableObject } from '@/activities/types/ActivityTargetableEntity';

export const targetableObjectsInDrawerState = atom<ActivityTargetableObject[]>({
  key: 'targetableObjectsInDrawerState',
  default: [],
});
