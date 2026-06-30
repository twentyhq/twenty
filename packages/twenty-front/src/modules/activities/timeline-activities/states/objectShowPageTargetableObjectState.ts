import { type ActivityTargetableObject } from '@/activities/types/ActivityTargetableEntity';

import { createAtomState } from '@/ui/utilities/state/jotai/utils/createAtomState';

export const objectShowPageTargetableObjectState =
  createAtomState<ActivityTargetableObject | null>({
    key: 'objectShowPageTargetableObjectState',
    defaultValue: null,
  });
