import { createState } from '@/ui/utilities/state/jotai/utils/createState';
export type StepsState = {
  activeStep: number;
};

export const stepBarInternalState = createState<StepsState>({
  key: 'step-bar/internal-state',
  defaultValue: {
    activeStep: -1,
  },
});
