import { atom } from 'recoil';

export type GlobalErrorStateType = {
  error: Error | null;
  isActive: boolean;
};

export const globalErrorState = atom<GlobalErrorStateType>({
  key: 'globalErrorState',
  default: {
    error: null,
    isActive: false,
  },
});
