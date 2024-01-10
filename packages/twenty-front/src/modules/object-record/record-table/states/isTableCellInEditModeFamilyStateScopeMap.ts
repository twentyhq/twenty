import { createFamilyStateScopeMap } from '@/ui/utilities/recoil-scope/utils/createFamilyStateScopeMap';

import { TableCellPosition } from '../types/TableCellPosition';

export const isTableCellInEditModeFamilyStateScopeMap =
  createFamilyStateScopeMap<boolean, TableCellPosition>({
    key: 'isTableCellInEditModeFamilyStateScopeMap',
    defaultValue: false,
  });
