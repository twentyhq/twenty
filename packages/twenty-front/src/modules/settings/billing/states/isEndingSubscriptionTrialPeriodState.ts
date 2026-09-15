import { createAtomState } from '@/ui/utilities/state/jotai/utils/createAtomState';

export const isEndingSubscriptionTrialPeriodState = createAtomState<boolean>({
  key: 'billing/isEndingSubscriptionTrialPeriodState',
  defaultValue: false,
});
