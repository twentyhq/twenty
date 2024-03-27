import { createFamilyState } from 'twenty-ui';

export const activityBodyFamilyState = createFamilyState<
  string,
  { activityId: string }
>({
  key: 'activityBodyFamilyState',
  defaultValue: '',
});
