import { getSwitchBillingIntervalConfirmationMessage } from '@/settings/billing/utils/getSwitchBillingIntervalConfirmationMessage';
import { i18n } from '@lingui/core';
import {
  BillingPlanKey,
  SubscriptionInterval,
} from '~/generated-metadata/graphql';
import { messages as enMessages } from '~/locales/generated/en';

i18n.load('en', enMessages);
i18n.activate('en');

const buildParams = (
  overrides: Partial<
    Parameters<typeof getSwitchBillingIntervalConfirmationMessage>[0]
  > = {},
) => ({
  getBeautifiedRenewDate: () => 'October 14, 2026',
  isTrialing: false,
  price: 9,
  targetInterval: SubscriptionInterval.Year,
  targetPlanKey: BillingPlanKey.PRO,
  ...overrides,
});

describe('getSwitchBillingIntervalConfirmationMessage', () => {
  it('quotes a yearly switch as a monthly price billed annually', () => {
    expect(getSwitchBillingIntervalConfirmationMessage(buildParams())).toBe(
      'You will be charged $9 per user per month billed annually. A prorata with your current subscription will be applied. Your plan stays Pro, this only changes your billing interval.',
    );
  });

  it('announces the renew date for a downgrade to monthly', () => {
    expect(
      getSwitchBillingIntervalConfirmationMessage(
        buildParams({ price: 12, targetInterval: SubscriptionInterval.Month }),
      ),
    ).toBe(
      'You will be charged $12 per user per month billed monthly. The change will be applied the October 14, 2026. Your plan stays Pro, this only changes your billing interval.',
    );
  });

  it('names the target plan in the notice', () => {
    expect(
      getSwitchBillingIntervalConfirmationMessage(
        buildParams({ targetPlanKey: BillingPlanKey.ENTERPRISE }),
      ),
    ).toContain('Your plan stays Organization');
  });

  it('keeps the trial wording and skips the renew date while trialing', () => {
    expect(
      getSwitchBillingIntervalConfirmationMessage(
        buildParams({
          getBeautifiedRenewDate: () => {
            throw new Error('No renew date defined for current subscription.');
          },
          isTrialing: true,
          price: 12,
          targetInterval: SubscriptionInterval.Month,
        }),
      ),
    ).toBe(
      'Your billing interval will switch to monthly immediately and your trial will continue. When it ends, you will be charged $12 per user per month billed monthly. Your plan stays Pro, this only changes your billing interval.',
    );
  });
});
