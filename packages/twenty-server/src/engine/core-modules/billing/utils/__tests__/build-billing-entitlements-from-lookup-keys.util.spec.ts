import { BillingEntitlementKey } from 'src/engine/core-modules/billing/enums/billing-entitlement-key.enum';
import { buildBillingEntitlementsFromLookupKeys } from 'src/engine/core-modules/billing/utils/build-billing-entitlements-from-lookup-keys.util';

const buildEntitlements = (activeLookupKeys: string[]) =>
  buildBillingEntitlementsFromLookupKeys({
    workspaceId: 'workspace-1',
    stripeCustomerId: 'cus_1',
    activeLookupKeys,
  });

const findValue = (
  entitlements: ReturnType<typeof buildEntitlements>,
  key: BillingEntitlementKey,
) => entitlements.find((entitlement) => entitlement.key === key)?.value;

describe('buildBillingEntitlementsFromLookupKeys', () => {
  it('writes a row for every key, so a key Stripe does not grant reads as revoked', () => {
    const entitlements = buildEntitlements([]);

    expect(entitlements.map((entitlement) => entitlement.key).sort()).toEqual(
      Object.values(BillingEntitlementKey).sort(),
    );
    expect(entitlements).toContainEqual({
      workspaceId: 'workspace-1',
      key: BillingEntitlementKey.INCLUDED_FAST_MODEL,
      value: false,
      stripeCustomerId: 'cus_1',
    });
  });

  it('grants the included fast model only from its exact lookup key', () => {
    expect(
      findValue(
        buildEntitlements(['INCLUDED_FAST_MODEL']),
        BillingEntitlementKey.INCLUDED_FAST_MODEL,
      ),
    ).toBe(true);
    expect(
      findValue(
        buildEntitlements(['included_fast_model']),
        BillingEntitlementKey.INCLUDED_FAST_MODEL,
      ),
    ).toBe(false);
  });

  it('leaves other keys untouched by the included fast model grant', () => {
    const entitlements = buildEntitlements(['SSO', 'INCLUDED_FAST_MODEL']);

    expect(findValue(entitlements, BillingEntitlementKey.SSO)).toBe(true);
    expect(findValue(entitlements, BillingEntitlementKey.RLS)).toBe(false);
  });

  it('ignores lookup keys that are not entitlement keys', () => {
    const entitlements = buildEntitlements(['UNKNOWN_FEATURE']);

    expect(entitlements).toHaveLength(
      Object.values(BillingEntitlementKey).length,
    );
    expect(entitlements.some((entitlement) => entitlement.value)).toBe(false);
  });
});
