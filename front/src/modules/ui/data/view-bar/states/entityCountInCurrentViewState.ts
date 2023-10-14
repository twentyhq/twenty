import { atom } from 'recoil';

export const entityCountInCurrentViewState = atom<number>({
  key: 'entityCountInCurrentViewState',
  default: 0,
});
