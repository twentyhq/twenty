import { type CurrentWorkspace } from '@/auth/states/currentWorkspaceState';
import { type BillingEntitlementKey } from '~/generated-metadata/graphql';

export const checkIfBillingEntitlementIsEnabledOnWorkspace = (
  entitlementKey: BillingEntitlementKey,
  workspace: CurrentWorkspace | null | undefined,
) =>
  workspace?.billingEntitlements?.some(
    (entitlement) =>
      entitlement.key === entitlementKey && entitlement.value === true,
  ) === true;
