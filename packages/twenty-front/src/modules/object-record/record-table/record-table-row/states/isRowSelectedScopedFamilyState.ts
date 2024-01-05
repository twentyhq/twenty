import { createFamilyStateScopeMap } from '@/ui/utilities/recoil-scope/utils/createFamilyStateScopeMap';

export const isRowSelectedScopedFamilyState = createFamilyStateScopeMap<
  boolean,
  string
>({
  key: 'isRowSelectedFamilyState',
  defaultValue: false,
});
