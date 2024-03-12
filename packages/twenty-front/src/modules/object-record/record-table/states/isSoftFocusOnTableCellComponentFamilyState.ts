import { createComponentFamilyState } from '@/ui/utilities/state/component-state/utils/createComponentFamilyState';

import { TableCellPosition } from '../types/TableCellPosition';

export const isSoftFocusOnTableCellComponentFamilyState =
  createComponentFamilyState<boolean, TableCellPosition>({
    key: 'isSoftFocusOnTableCellComponentFamilyState',
    defaultValue: false,
  });
