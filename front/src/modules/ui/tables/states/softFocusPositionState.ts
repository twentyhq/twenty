import { atom } from 'recoil';

export type TablePosition = {
  row: number;
  column: number;
};

export const softFocusPositionState = atom<TablePosition>({
  key: 'softFocusPositionState',
  default: {
    row: 0,
    column: 1,
  },
});
