import { createStateV2 } from '@/ui/utilities/state/jotai/utils/createStateV2';
export type StepsState = {
  activeStep: number;
};

export const stepBarInternalState = createStateV2<StepsState>({
  key: 'step-bar/internal-state',
  defaultValue: {
    activeStep: -1,
  },
});
