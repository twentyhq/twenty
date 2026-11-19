import { createAtomState } from '@/ui/utilities/state/jotai/utils/createAtomState';

export const adminPanelBillingArrangementIdPendingEndState = createAtomState<
  string | null
>({
  key: 'adminPanelBillingArrangementIdPendingEndState',
  defaultValue: null,
});
