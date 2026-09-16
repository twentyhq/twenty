import { getSwitchBillingPlanConfirmationMessage } from '@/settings/billing/utils/getSwitchBillingPlanConfirmationMessage';
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
    Parameters<typeof getSwitchBillingPlanConfirmationMessage>[0]
  > = {},
) => ({
  getBeautifiedRenewDate: () => 'October 14, 2026',
  isTrialing: false,
  price: 25,
  targetInterval: SubscriptionInterval.Month,
  targetPlanKey: BillingPlanKey.ENTERPRISE,
  ...overrides,
});

describe('getSwitchBillingPlanConfirmationMessage', () => {
  it('quotes the monthly price and states that the monthly interval is unchanged', () => {
    expect(getSwitchBillingPlanConfirmationMessage(buildParams())).toBe(
      'You will be charged $25 per user per month. Your billing interval stays monthly, this only changes your plan.',
    );
  });

  it('quotes a yearly target as a monthly price billed annually', () => {
    expect(
      getSwitchBillingPlanConfirmationMessage(
        buildParams({ price: 19, targetInterval: SubscriptionInterval.Year }),
      ),
    ).toBe(
      'You will be charged $19 per user per month billed annually. Your billing interval stays yearly, this only changes your plan.',
    );
  });

  it('names the target interval, not the subscribed one, when an interval switch is scheduled', () => {
    const message = getSwitchBillingPlanConfirmationMessage(
      buildParams({ price: 25, targetInterval: SubscriptionInterval.Month }),
    );

    expect(message).toContain('$25 per user per month.');
    expect(message).toContain('Your billing interval stays monthly');
    expect(message).not.toContain('billed annually');
  });

  it('announces the renew date for a downgrade to Pro', () => {
    expect(
      getSwitchBillingPlanConfirmationMessage(
        buildParams({ price: 12, targetPlanKey: BillingPlanKey.PRO }),
      ),
    ).toBe(
      'You will be charged $12 per user per month. The change will be applied the October 14, 2026. Your billing interval stays monthly, this only changes your plan.',
    );
  });

  it('keeps the trial wording and skips the renew date while trialing', () => {
    expect(
      getSwitchBillingPlanConfirmationMessage(
        buildParams({
          getBeautifiedRenewDate: () => {
            throw new Error('No renew date defined for current subscription.');
          },
          isTrialing: true,
        }),
      ),
    ).toBe(
      'Your plan will switch to Organization immediately and your trial will continue. When it ends, you will be charged $25 per user per month. Your billing interval stays monthly, this only changes your plan.',
    );
  });
});
