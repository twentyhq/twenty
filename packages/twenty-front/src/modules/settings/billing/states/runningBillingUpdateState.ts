import { type BillingUpdateKind } from '@/settings/billing/types/billingUpdateKind.type';
import { createAtomState } from '@/ui/utilities/state/jotai/utils/createAtomState';

export const runningBillingUpdateState =
  createAtomState<BillingUpdateKind | null>({
    key: 'billing/runningBillingUpdateState',
    defaultValue: null,
  });
