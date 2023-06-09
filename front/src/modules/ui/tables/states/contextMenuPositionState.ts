import { atom } from 'recoil';

export interface PositionState {
  x: number | null;
  y: number | null;
}

export const contextMenuPositionState = atom<PositionState>({
  key: 'contextMenuPositionState',
  default: {
    x: null,
    y: null,
  },
});
