import { type ActivityTargetableObject } from '@/activities/types/ActivityTargetableEntity';

import { createStateV2 } from '@/ui/utilities/state/jotai/utils/createStateV2';

export const objectShowPageTargetableObjectStateV2 =
  createStateV2<ActivityTargetableObject | null>({
    key: 'objectShowPageTargetableObjectStateV2',
    defaultValue: null,
  });
