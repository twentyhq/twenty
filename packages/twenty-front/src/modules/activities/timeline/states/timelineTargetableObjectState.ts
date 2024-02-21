import { atom } from 'recoil';

import { ActivityTargetableObject } from '@/activities/types/ActivityTargetableEntity';

export const timelineTargetableObjectState =
  atom<ActivityTargetableObject | null>({
    key: 'timelineTargetableObjectState',
    default: null,
  });
