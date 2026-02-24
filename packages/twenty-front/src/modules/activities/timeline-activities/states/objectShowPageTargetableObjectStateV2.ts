import { type ActivityTargetableObject } from '@/activities/types/ActivityTargetableEntity';

import { createState } from '@/ui/utilities/state/jotai/utils/createState';

export const objectShowPageTargetableObjectStateV2 =
  createState<ActivityTargetableObject | null>({
    key: 'objectShowPageTargetableObjectStateV2',
    defaultValue: null,
  });
