import { createState } from 'twenty-ui';

import { ActivityTargetableObject } from '@/activities/types/ActivityTargetableEntity';

export const targetableObjectsInDrawerState = createState<
  ActivityTargetableObject[]
>({
  key: 'targetableObjectsInDrawerState',
  defaultValue: [],
});
