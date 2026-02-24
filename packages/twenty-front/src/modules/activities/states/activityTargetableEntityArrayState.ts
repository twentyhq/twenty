import { type ActivityTargetableObject } from '@/activities/types/ActivityTargetableEntity';
import { createStateV2 } from '@/ui/utilities/state/jotai/utils/createStateV2';

export const activityTargetableEntityArrayState = createStateV2<
  ActivityTargetableObject[]
>({
  key: 'activities/targetable-entity-array',
  defaultValue: [],
});
