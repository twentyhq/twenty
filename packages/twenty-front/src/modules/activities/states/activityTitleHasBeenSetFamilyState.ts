import { createFamilyState } from 'twenty-ui';

export const activityTitleHasBeenSetFamilyState = createFamilyState<
  boolean,
  { activityId: string }
>({
  key: 'activityTitleHasBeenSetFamilyState',
  defaultValue: false,
});
