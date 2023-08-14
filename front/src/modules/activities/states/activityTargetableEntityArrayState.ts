import { atom } from 'recoil';

import { ActivityTargetableEntity } from '../types/ActivityTargetableEntity';

export const activityTargetableEntityArrayState = atom<
  ActivityTargetableEntity[]
>({
  key: 'activities/targetable-entity-array',
  default: [],
});
