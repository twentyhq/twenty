import { createFamilyState } from 'twenty-ui';

export const activityTitleFamilyState = createFamilyState<
  string,
  { activityId: string }
>({
  key: 'activityTitleFamilyState',
  defaultValue: '',
});
