import { createAtomState } from '@/ui/utilities/state/jotai/utils/createAtomState';

export const isUpgradeFreeTrialPaymentSubmittingState = createAtomState<boolean>(
  {
    key: 'isUpgradeFreeTrialPaymentSubmittingState',
    defaultValue: false,
  },
);
