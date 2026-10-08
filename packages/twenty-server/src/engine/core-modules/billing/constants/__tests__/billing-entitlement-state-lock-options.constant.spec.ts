/* @license Enterprise */

import { BILLING_ENTITLEMENT_STATE_LOCK_OPTIONS } from 'src/engine/core-modules/billing/constants/billing-entitlement-state-lock-options.constant';

describe('BILLING_ENTITLEMENT_STATE_LOCK_OPTIONS', () => {
  it('waits past the expiry so a waiter can take a key its holder abandoned', () => {
    const { ttl, ms, maxRetries } = BILLING_ENTITLEMENT_STATE_LOCK_OPTIONS;

    // withLock's last attempt is at (maxRetries - 1) * ms, just before an expiry-equal budget frees the key
    const lastAttemptAt = (maxRetries - 1) * ms;

    expect(lastAttemptAt).toBeGreaterThan(ttl);
  });
});
