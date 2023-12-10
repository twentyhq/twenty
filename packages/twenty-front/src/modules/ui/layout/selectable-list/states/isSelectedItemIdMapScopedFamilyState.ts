import { createScopedFamilyState } from '@/ui/utilities/recoil-scope/utils/createScopedFamilyState';

export const isSelectedItemIdMapScopedFamilyState = createScopedFamilyState<
  boolean,
  string
>({
  key: 'isSelectedItemIdMapScopedFamilyState',
  defaultValue: false,
});
