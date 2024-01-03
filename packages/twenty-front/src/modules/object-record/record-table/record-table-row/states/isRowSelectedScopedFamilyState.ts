import { createScopedFamilyState } from '@/ui/utilities/recoil-scope/utils/createScopedFamilyState';

export const isRowSelectedScopedFamilyState = createScopedFamilyState<
  boolean,
  string
>({
  key: 'isRowSelectedFamilyState',
  defaultValue: false,
});
