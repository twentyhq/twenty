import { atom } from 'recoil';

export const isDraggingAndSelectingState = atom<boolean>({
  key: 'isDraggingAndSelectingState',
  default: true,
});
