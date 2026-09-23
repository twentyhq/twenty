import { i18n } from '@lingui/core';
import { I18nProvider } from '@lingui/react';
import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useState } from 'react';
import { ThemeProvider } from 'twenty-ui/theme-constants';

import { SettingsBillingPlanComparisonTable } from '@/settings/billing/components/internal/SettingsBillingPlanComparisonTable';
import { type SettingsBillingPlanInterval } from '@/settings/billing/types/SettingsBillingPlanComparison';
import {
  BillingPlanKey,
  SubscriptionInterval,
} from '~/generated-metadata/graphql';

const originalPointerEvent = window.PointerEvent;

beforeAll(() => {
  Object.defineProperty(window, 'PointerEvent', {
    configurable: true,
    value: MouseEvent,
  });
});

afterAll(() => {
  Object.defineProperty(window, 'PointerEvent', {
    configurable: true,
    value: originalPointerEvent,
  });
});

const BillingComparison = () => {
  const [interval, setInterval] = useState<SettingsBillingPlanInterval>(
    SubscriptionInterval.Year,
  );

  return (
    <I18nProvider i18n={i18n}>
      <ThemeProvider colorScheme="light">
        <SettingsBillingPlanComparisonTable
          billingInterval={interval}
          onBillingIntervalChange={setInterval}
          planActions={{
            [BillingPlanKey.PRO]: { title: 'Choose Pro', variant: 'solid' },
            [BillingPlanKey.ENTERPRISE]: {
              title: 'Choose Organization',
              variant: 'outline',
            },
          }}
          planPrices={{
            [BillingPlanKey.PRO]: {
              [SubscriptionInterval.Year]: 9,
              [SubscriptionInterval.Month]: 12,
            },
            [BillingPlanKey.ENTERPRISE]: {
              [SubscriptionInterval.Year]: 19,
              [SubscriptionInterval.Month]: 25,
            },
          }}
        />
      </ThemeProvider>
    </I18nProvider>
  );
};

it('updates the billing period and price context through the radio choices', async () => {
  const user = userEvent.setup();
  render(<BillingComparison />);
  const period = within(
    screen.getByRole('radiogroup', { name: 'Billing period' }),
  );

  expect(period.getByRole('radio', { name: 'Annual' })).toBeChecked();
  expect(screen.getByText('Save 25% when billed annually')).toBeVisible();
  await user.click(period.getByRole('radio', { name: 'Monthly' }));
  expect(period.getByRole('radio', { name: 'Monthly' })).toBeChecked();
  expect(screen.getByText('Billed monthly')).toBeVisible();
  await user.keyboard('{ArrowLeft}');
  expect(period.getByRole('radio', { name: 'Annual' })).toBeChecked();
  expect(screen.getByText('Save 25% when billed annually')).toBeVisible();
});
