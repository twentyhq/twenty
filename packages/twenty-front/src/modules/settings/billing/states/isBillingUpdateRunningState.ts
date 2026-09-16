import { createAtomState } from '@/ui/utilities/state/jotai/utils/createAtomState';

export const isBillingUpdateRunningState = createAtomState<boolean>({
  key: 'billing/isBillingUpdateRunningState',
  defaultValue: false,
});
