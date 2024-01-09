import { createFamilyStateScopeMap } from '@/ui/utilities/recoil-scope/utils/createFamilyStateScopeMap';

export const isSelectedItemIdFamilyStateScopeMap = createFamilyStateScopeMap<
  boolean,
  string
>({
  key: 'isSelectedItemIdMapScopedFamilyState',
  defaultValue: false,
});
