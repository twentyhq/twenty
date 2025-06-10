import { ActivityTargetableObject } from '../types/ActivityTargetableEntity';
import { createState } from 'twenty-ui/utilities';

export const activityTargetableEntityArrayState = createState<
  ActivityTargetableObject[]
>({
  key: 'activities/targetable-entity-array',
  defaultValue: [],
});
