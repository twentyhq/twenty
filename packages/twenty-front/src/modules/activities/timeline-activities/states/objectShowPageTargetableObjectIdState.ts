import { atom } from 'recoil';

import { type ActivityTargetableObject } from '@/activities/types/ActivityTargetableEntity';

export const objectShowPageTargetableObjectState =
  atom<ActivityTargetableObject | null>({
    key: 'objectShowPageTargetableObjectState',
    default: null,
  });
