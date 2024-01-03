import { createScopedFamilyState } from '@/ui/utilities/recoil-scope/utils/createScopedFamilyState';

import { TableCellPosition } from '../types/TableCellPosition';

export const isTableCellInEditModeScopedFamilyState = createScopedFamilyState<
  boolean,
  TableCellPosition
>({
  key: 'isTableCellInEditModeScopedFamilyState',
  defaultValue: false,
});
