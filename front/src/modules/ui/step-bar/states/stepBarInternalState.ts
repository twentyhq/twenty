import { atom } from 'recoil';

export type StepsState = {
  activeStep: number;
};

export const stepBarInternalState = atom<StepsState>({
  key: 'step-bar/internal-state',
  default: {
    activeStep: 0,
  },
});
