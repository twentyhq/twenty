/* @license Enterprise */

import { SubscriptionStatus } from 'src/engine/core-modules/billing/enums/billing-subscription-status.enum';
import { isProvisionedBillingSubscription } from 'src/engine/core-modules/billing/utils/is-provisioned-billing-subscription.util';

describe('isProvisionedBillingSubscription', () => {
  it.each([
    [SubscriptionStatus.Active, true],
    [SubscriptionStatus.Trialing, true],
    [SubscriptionStatus.PastDue, true],
    [SubscriptionStatus.Unpaid, true],
    [SubscriptionStatus.Paused, true],
    [SubscriptionStatus.Canceled, true],
    [SubscriptionStatus.Incomplete, false],
    [SubscriptionStatus.IncompleteExpired, false],
  ])('should return %s -> %s', (status, expected) => {
    expect(isProvisionedBillingSubscription({ status })).toBe(expected);
  });
});
