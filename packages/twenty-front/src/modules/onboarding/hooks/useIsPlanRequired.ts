import { currentWorkspaceState } from '@/auth/states/currentWorkspaceState';
import { billingState } from '@/client-config/states/billingState';
import { getIsPlanRequired } from '@/onboarding/utils/getIsPlanRequired';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';

export const useIsPlanRequired = () => {
  const billing = useAtomStateValue(billingState);
  const currentWorkspace = useAtomStateValue(currentWorkspaceState);

  return getIsPlanRequired({
    isBillingEnabled: billing?.isBillingEnabled ?? false,
    currentWorkspace,
  });
};
