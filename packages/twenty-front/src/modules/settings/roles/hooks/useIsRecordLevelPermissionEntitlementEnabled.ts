import { currentWorkspaceState } from '@/auth/states/currentWorkspaceState';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';
import { BillingEntitlementKey } from '~/generated-metadata/graphql';

export const useIsRecordLevelPermissionEntitlementEnabled = (): boolean => {
  const currentWorkspace = useAtomStateValue(currentWorkspaceState);

  return (
    currentWorkspace?.billingEntitlements?.some(
      (entitlement) =>
        entitlement.key === BillingEntitlementKey.RLS &&
        entitlement.value === true,
    ) ?? false
  );
};
