import { atom } from 'recoil';

import { ActivityTargetableObject } from '../types/ActivityTargetableEntity';

export const activityTargetableEntityArrayState = atom<
  ActivityTargetableObject[]
>({
  key: 'activities/targetable-entity-array',
  default: [],
});
