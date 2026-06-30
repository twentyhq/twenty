import { type ActivityTargetableObject } from '@/activities/types/ActivityTargetableEntity';
import { createAtomState } from '@/ui/utilities/state/jotai/utils/createAtomState';

export const activityTargetableEntityArrayState = createAtomState<
  ActivityTargetableObject[]
>({
  key: 'activities/targetable-entity-array',
  defaultValue: [],
});
