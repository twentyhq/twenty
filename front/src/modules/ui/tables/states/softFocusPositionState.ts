import { atom } from 'recoil';

export type TablePosition = {
  row: number;
  column: number;
};

export const softFocusPositionState = atom<TablePosition | null>({
  key: 'softFocusPositionState',
  default: null,
});
