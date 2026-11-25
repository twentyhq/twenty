import { computeApplicationsSubscriptionCost } from '@/settings/billing/utils/computeApplicationsSubscriptionCost';

describe('computeApplicationsSubscriptionCost', () => {
  it('keeps installed app items and sums their subtotal', () => {
    expect(
      computeApplicationsSubscriptionCost([
        { applicationName: 'LinkedIn', quantity: 3, unitAmount: 700 },
        { applicationName: 'Slack', quantity: 4, unitAmount: 200 },
        { applicationName: null, quantity: 1, unitAmount: 1200 },
      ]),
    ).toMatchObject({ applicationsCount: 2, applicationsSubtotalCents: 2900 });
  });

  it('leaves the subtotal undefined when an app item has no price', () => {
    expect(
      computeApplicationsSubscriptionCost([
        { applicationName: 'LinkedIn', quantity: 3, unitAmount: null },
      ]).applicationsSubtotalCents,
    ).toBeUndefined();
  });
});
