import { type ActivityTargetableObject } from '@/activities/types/ActivityTargetableEntity';
import { createState } from '@/ui/utilities/state/jotai/utils/createState';

export const activityTargetableEntityArrayState = createState<
  ActivityTargetableObject[]
>({
  key: 'activities/targetable-entity-array',
  defaultValue: [],
});
