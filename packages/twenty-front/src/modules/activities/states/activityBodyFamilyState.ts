import { createFamilyState } from '@/ui/utilities/state/jotai/utils/createFamilyState';

export const activityBodyFamilyState = createFamilyState<
  string,
  { activityId: string }
>({
  key: 'activityBodyFamilyState',
  defaultValue: '',
});
