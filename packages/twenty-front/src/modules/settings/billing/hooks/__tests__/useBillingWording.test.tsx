import { i18n } from '@lingui/core';
import { I18nProvider } from '@lingui/react';
import { renderHook } from '@testing-library/react';
import { type ReactNode } from 'react';

import { useBillingWording } from '@/settings/billing/hooks/useBillingWording';
import {
  BillingPlanKey,
  SubscriptionInterval,
  SubscriptionStatus,
} from '~/generated-metadata/graphql';

let mockCurrentInterval: SubscriptionInterval = SubscriptionInterval.Month;

jest.mock('@/ui/utilities/state/jotai/hooks/useAtomStateValue', () => ({
  useAtomStateValue: () => ({
    currentBillingSubscription: {
      currentPeriodEnd: '2026-10-14T00:00:00.000Z',
      interval: mockCurrentInterval,
      status: SubscriptionStatus.Active,
    },
  }),
}));

jest.mock('@/workspace/hooks/useSubscriptionStatus', () => ({
  useSubscriptionStatus: () => SubscriptionStatus.Active,
}));

jest.mock('@/settings/billing/hooks/useCurrentPlan', () => ({
  useCurrentPlan: () => ({ currentPlan: { planKey: BillingPlanKey.PRO } }),
}));

jest.mock('@/settings/billing/hooks/useCurrentBillingFlags', () => ({
  useCurrentBillingFlags: () => ({
    isYearlyPlan: mockCurrentInterval === SubscriptionInterval.Year,
  }),
}));

jest.mock('@/settings/billing/hooks/useFormatPrices', () => ({
  useFormatPrices: () => ({
    formatPrices: {
      ENTERPRISE: {
        [SubscriptionInterval.Month]: 25,
        [SubscriptionInterval.Year]: 19,
      },
      PRO: {
        [SubscriptionInterval.Month]: 12,
        [SubscriptionInterval.Year]: 9,
      },
    },
  }),
}));

jest.mock('@/settings/billing/utils/getSubscriptionPlanKey', () => ({
  getSubscriptionPlanKey: () => BillingPlanKey.PRO,
}));

const wrapper = ({ children }: { children: ReactNode }) => (
  <I18nProvider i18n={i18n}>{children}</I18nProvider>
);

const renderBillingWording = () =>
  renderHook(() => useBillingWording(), { wrapper }).result.current;

describe('useBillingWording', () => {
  beforeEach(() => {
    mockCurrentInterval = SubscriptionInterval.Month;
  });

  it('quotes the subscribed interval price without a notice when that interval is selected', () => {
    const { confirmationModalSwitchToOrganizationMessage } =
      renderBillingWording();

    const message = confirmationModalSwitchToOrganizationMessage(
      SubscriptionInterval.Month,
    );

    expect(message).toBe('You will be charged $25 per user per month.');
  });

  it('warns that the billing interval is unchanged when another interval is selected', () => {
    const { confirmationModalSwitchToOrganizationMessage } =
      renderBillingWording();

    const message = confirmationModalSwitchToOrganizationMessage(
      SubscriptionInterval.Year,
    );

    expect(message).toBe(
      'You will be charged $25 per user per month. Your billing interval stays monthly: change it separately from the Billing tab once this plan change is applied.',
    );
  });

  it('quotes the yearly plan as a monthly price billed annually', () => {
    const { confirmationModalSwitchToYearlyMessage } = renderBillingWording();

    expect(confirmationModalSwitchToYearlyMessage()).toBe(
      'You will be charged $9 per user per month billed annually. A prorata with your current subscription will be applied.',
    );
  });

  it('names the subscribed interval in the notice of a yearly subscription', () => {
    mockCurrentInterval = SubscriptionInterval.Year;

    const { confirmationModalSwitchToProMessage } = renderBillingWording();

    const message = confirmationModalSwitchToProMessage(
      SubscriptionInterval.Month,
    );

    expect(message).toContain(
      'You will be charged $9 per user per month billed annually.',
    );
    expect(message).toContain('Your billing interval stays yearly');
  });
});
