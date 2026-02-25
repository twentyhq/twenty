import { type ActivityTargetableObject } from '@/activities/types/ActivityTargetableEntity';

import { createAtomState } from '@/ui/utilities/state/jotai/utils/createAtomState';

export const objectShowPageTargetableObjectStateV2 =
  createAtomState<ActivityTargetableObject | null>({
    key: 'objectShowPageTargetableObjectStateV2',
    defaultValue: null,
  });
