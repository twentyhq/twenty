import { createScopedFamilyState } from '@/ui/utilities/recoil-scope/utils/createScopedFamilyState';

export const selectableItemIdsSelectedMapScopedFamilyState =
  createScopedFamilyState<boolean, string>({
    key: 'selectableItemIdsSelectedMapScopedFamilyState',
    defaultValue: false,
  });
