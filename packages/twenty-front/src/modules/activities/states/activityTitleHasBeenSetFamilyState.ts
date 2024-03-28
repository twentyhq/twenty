import { createFamilyState } from '@/ui/utilities/state/utils/createFamilyState';

export const activityTitleHasBeenSetFamilyState = createFamilyState<
  boolean,
  { activityId: string }
>({
  key: 'activityTitleHasBeenSetFamilyState',
  defaultValue: false,
});
