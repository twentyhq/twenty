import { createState } from 'twenty-ui';

import { ActivityTargetableObject } from '../types/ActivityTargetableEntity';

export const activityTargetableEntityArrayState = createState<
  ActivityTargetableObject[]
>({
  key: 'activities/targetable-entity-array',
  defaultValue: [],
});
