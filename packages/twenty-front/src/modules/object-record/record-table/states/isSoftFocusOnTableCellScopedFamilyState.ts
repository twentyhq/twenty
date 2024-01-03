import { createScopedFamilyState } from '@/ui/utilities/recoil-scope/utils/createScopedFamilyState';

import { TableCellPosition } from '../types/TableCellPosition';

export const isSoftFocusOnTableCellScopedFamilyState = createScopedFamilyState<
  boolean,
  TableCellPosition
>({
  key: 'isSoftFocusOnTableCellScopedFamilyState',
  defaultValue: false,
});
