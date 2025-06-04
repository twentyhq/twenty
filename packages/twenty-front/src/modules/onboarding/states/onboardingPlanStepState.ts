import { createState } from 'twenty-ui/utilities';

export enum OnboardingPlanStep {
  Init = 'init',
  InterChargeData = 'interChargeData',
}

export const onboardingPlanStepState = createState<OnboardingPlanStep>({
  key: 'onboardingPlanStepState',
  defaultValue: OnboardingPlanStep.Init,
});
