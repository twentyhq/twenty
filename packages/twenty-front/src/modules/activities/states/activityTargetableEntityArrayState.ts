import { createState } from '@ui/utilities/state/utils/createState';

import { ActivityTargetableObject } from '../types/ActivityTargetableEntity';

export const activityTargetableEntityArrayState = createState<
  ActivityTargetableObject[]
>({
  key: 'activities/targetable-entity-array',
  defaultValue: [],
});
