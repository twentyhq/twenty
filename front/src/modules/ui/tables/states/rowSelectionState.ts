import { RowSelectionState } from '@tanstack/react-table';
import { atom } from 'recoil';

export const currentRowSelectionState = atom<RowSelectionState>({
  key: 'ui/table-row-selection-state',
  default: {},
});
