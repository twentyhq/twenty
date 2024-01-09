import { createFamilyStateScopeMap } from '@/ui/utilities/recoil-scope/utils/createFamilyStateScopeMap';

import { TableCellPosition } from '../types/TableCellPosition';

export const isTableCellInEditModeScopedFamilyState = createFamilyStateScopeMap<
  boolean,
  TableCellPosition
>({
  key: 'isTableCellInEditModeScopedFamilyState',
  defaultValue: false,
});
