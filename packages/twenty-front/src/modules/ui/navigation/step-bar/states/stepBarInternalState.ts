import { createAtomState } from '@/ui/utilities/state/jotai/utils/createAtomState';
export type StepsState = {
  activeStep: number;
};

export const stepBarInternalState = createAtomState<StepsState>({
  key: 'step-bar/internal-state',
  defaultValue: {
    activeStep: -1,
  },
});
