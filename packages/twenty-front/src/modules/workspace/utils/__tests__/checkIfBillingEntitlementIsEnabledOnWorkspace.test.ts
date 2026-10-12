import { type CurrentWorkspace } from '@/auth/states/currentWorkspaceState';
import { checkIfBillingEntitlementIsEnabledOnWorkspace } from '@/workspace/utils/checkIfBillingEntitlementIsEnabledOnWorkspace';
import { BillingEntitlementKey } from '~/generated-metadata/graphql';

const makeWorkspace = (
  billingEntitlements?: Array<{ key: BillingEntitlementKey; value: boolean }>,
): CurrentWorkspace =>
  ({
    id: 'workspace-1',
    billingEntitlements,
  }) as unknown as CurrentWorkspace;

describe('checkIfBillingEntitlementIsEnabledOnWorkspace', () => {
  it('should return true when the entitlement is enabled', () => {
    const workspace = makeWorkspace([
      { key: BillingEntitlementKey.SSO, value: false },
      { key: BillingEntitlementKey.AUDIT_LOGS, value: true },
    ]);

    expect(
      checkIfBillingEntitlementIsEnabledOnWorkspace(
        BillingEntitlementKey.AUDIT_LOGS,
        workspace,
      ),
    ).toBe(true);
  });

  it('should return false when the entitlement is disabled', () => {
    const workspace = makeWorkspace([
      { key: BillingEntitlementKey.AUDIT_LOGS, value: false },
    ]);

    expect(
      checkIfBillingEntitlementIsEnabledOnWorkspace(
        BillingEntitlementKey.AUDIT_LOGS,
        workspace,
      ),
    ).toBe(false);
  });

  it('should return false when the entitlement is missing', () => {
    expect(
      checkIfBillingEntitlementIsEnabledOnWorkspace(
        BillingEntitlementKey.RLS,
        makeWorkspace([{ key: BillingEntitlementKey.SSO, value: true }]),
      ),
    ).toBe(false);
    expect(
      checkIfBillingEntitlementIsEnabledOnWorkspace(
        BillingEntitlementKey.RLS,
        makeWorkspace(),
      ),
    ).toBe(false);
    expect(
      checkIfBillingEntitlementIsEnabledOnWorkspace(
        BillingEntitlementKey.RLS,
        null,
      ),
    ).toBe(false);
  });
});
