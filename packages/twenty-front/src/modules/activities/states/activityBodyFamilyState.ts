import { createFamilyState } from '@/ui/utilities/state/utils/createFamilyState';

export const activityBodyFamilyState = createFamilyState<
  string,
  { activityId: string }
>({
  key: 'activityBodyFamilyState',
  defaultValue: '',
});
