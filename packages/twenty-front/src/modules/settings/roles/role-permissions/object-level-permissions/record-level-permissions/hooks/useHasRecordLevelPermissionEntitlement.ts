import { currentWorkspaceState } from '@/auth/states/currentWorkspaceState';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';
import { checkIfBillingEntitlementIsEnabledOnWorkspace } from '@/workspace/utils/checkIfBillingEntitlementIsEnabledOnWorkspace';
import { BillingEntitlementKey } from '~/generated-metadata/graphql';

export const useHasRecordLevelPermissionEntitlement = () => {
  const currentWorkspace = useAtomStateValue(currentWorkspaceState);

  return checkIfBillingEntitlementIsEnabledOnWorkspace(
    BillingEntitlementKey.RLS,
    currentWorkspace,
  );
};
