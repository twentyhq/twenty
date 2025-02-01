import { createState } from "twenty-shared";

export type StepsState = {
  activeStep: number;
};

export const stepBarInternalState = createState<StepsState>({
  key: 'step-bar/internal-state',
  defaultValue: {
    activeStep: -1,
  },
});
