import { currentWorkspaceState } from '@/auth/states/currentWorkspaceState';
import { findNextBillingPhase } from '@/settings/billing/utils/findNextBillingPhase';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';

export const useNextBillingPhase = () => {
  const currentWorkspace = useAtomStateValue(currentWorkspaceState);

  const nextBillingPhase = findNextBillingPhase(
    currentWorkspace?.currentBillingSubscription?.phases ?? [],
    Date.now(),
  );

  return { nextBillingPhase };
};
