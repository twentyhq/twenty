import { createFamilyState } from '@/ui/utilities/state/utils/createFamilyState';

export const activityTitleFamilyState = createFamilyState<
  string,
  { activityId: string }
>({
  key: 'activityTitleFamilyState',
  defaultValue: '',
});
