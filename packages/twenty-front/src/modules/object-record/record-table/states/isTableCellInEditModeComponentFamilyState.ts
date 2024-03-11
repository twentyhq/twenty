import { createComponentFamilyState } from '@/ui/utilities/state/component-state/utils/createComponentFamilyState';

import { TableCellPosition } from '../types/TableCellPosition';

export const isTableCellInEditModeComponentFamilyState =
  createComponentFamilyState<boolean, TableCellPosition>({
    key: 'isTableCellInEditModeComponentFamilyState',
    defaultValue: false,
  });
