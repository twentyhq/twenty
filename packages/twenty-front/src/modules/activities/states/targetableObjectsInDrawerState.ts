import { ActivityTargetableObject } from '@/activities/types/ActivityTargetableEntity';
import { createState } from '@/ui/utilities/state/utils/createState';

export const targetableObjectsInDrawerState = createState<
  ActivityTargetableObject[]
>({
  key: 'targetableObjectsInDrawerState',
  defaultValue: [],
});
