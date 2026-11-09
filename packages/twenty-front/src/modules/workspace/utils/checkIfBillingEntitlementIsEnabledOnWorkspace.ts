import { type CurrentWorkspace } from '@/auth/states/currentWorkspaceState';
import { type BillingEntitlementKey } from '~/generated-metadata/graphql';

export const checkIfBillingEntitlementIsEnabledOnWorkspace = (
  entitlementKey: BillingEntitlementKey,
  workspace:
    | Partial<Pick<CurrentWorkspace, 'billingEntitlements'>>
    | null
    | undefined,
) =>
  workspace?.billingEntitlements?.some(
    (entitlement) =>
      entitlement.key === entitlementKey && entitlement.value === true,
  ) === true;
