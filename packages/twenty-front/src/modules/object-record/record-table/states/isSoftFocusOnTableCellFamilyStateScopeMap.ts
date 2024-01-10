import { createFamilyStateScopeMap } from '@/ui/utilities/recoil-scope/utils/createFamilyStateScopeMap';

import { TableCellPosition } from '../types/TableCellPosition';

export const isSoftFocusOnTableCellFamilyStateScopeMap =
  createFamilyStateScopeMap<boolean, TableCellPosition>({
    key: 'isSoftFocusOnTableCellFamilyStateScopeMap',
    defaultValue: false,
  });
