/* @license Enterprise */

import { BILLING_ENTITLEMENT_STATE_LOCK_OPTIONS } from 'src/engine/core-modules/billing/constants/billing-entitlement-state-lock-options.constant';

describe('BILLING_ENTITLEMENT_STATE_LOCK_OPTIONS', () => {
  it('waits past the expiry so a waiter can take a key its holder abandoned', () => {
    const { ttl, ms, maxRetries } = BILLING_ENTITLEMENT_STATE_LOCK_OPTIONS;

    // withLock attempts at 0, ms, 2*ms ... (maxRetries - 1) * ms, so a budget
    // that only equals the expiry makes its last attempt just before the key
    // frees. Tuning either number without the other reintroduces that.
    const lastAttemptAt = ((maxRetries as number) - 1) * (ms as number);

    expect(lastAttemptAt).toBeGreaterThan(ttl as number);
  });
});
