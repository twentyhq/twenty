import { createFamilyStateScopeMap } from '@/ui/utilities/recoil-scope/utils/createFamilyStateScopeMap';

import { TableCellPosition } from '../types/TableCellPosition';

export const isSoftFocusOnTableCellScopedFamilyState =
  createFamilyStateScopeMap<boolean, TableCellPosition>({
    key: 'isSoftFocusOnTableCellScopedFamilyState',
    defaultValue: false,
  });
