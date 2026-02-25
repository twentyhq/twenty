import { createAtomFamilyState } from '@/ui/utilities/state/jotai/utils/createAtomFamilyState';

export const activityBodyFamilyState = createAtomFamilyState<
  string,
  { activityId: string }
>({
  key: 'activityBodyFamilyState',
  defaultValue: '',
});
