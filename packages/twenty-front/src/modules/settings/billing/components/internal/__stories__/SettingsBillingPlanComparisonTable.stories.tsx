import { type Meta, type StoryObj } from '@storybook/react-vite';
import { type ComponentProps, useState } from 'react';
import { expect, fn, userEvent, within } from 'storybook/test';
import { ComponentDecorator } from 'twenty-ui/testing';

import { SettingsBillingPlanComparisonTable } from '@/settings/billing/components/internal/SettingsBillingPlanComparisonTable';
import {
  BillingPlanKey,
  SubscriptionInterval,
} from '~/generated-metadata/graphql';

const BillingComparison = (
  props: ComponentProps<typeof SettingsBillingPlanComparisonTable>,
) => {
  const [billingInterval, setBillingInterval] = useState(props.billingInterval);

  return (
    <SettingsBillingPlanComparisonTable
      {...props}
      billingInterval={billingInterval}
      onBillingIntervalChange={(interval) => {
        props.onBillingIntervalChange(interval);
        setBillingInterval(interval);
      }}
    />
  );
};

const meta = {
  title: 'Modules/Settings/Billing/SettingsBillingPlanComparisonTable',
  component: SettingsBillingPlanComparisonTable,
  decorators: [ComponentDecorator],
  parameters: { container: { width: 694 } },
  args: {
    billingInterval: SubscriptionInterval.Year,
    onBillingIntervalChange: fn(),
    comparedPlans: [
      {
        action: { title: 'Choose Pro', variant: 'solid' },
        planKey: BillingPlanKey.PRO,
      },
      {
        action: { title: 'Choose Organization', variant: 'outline' },
        planKey: BillingPlanKey.ENTERPRISE,
      },
    ],
    planPrices: {
      [BillingPlanKey.PRO]: {
        [SubscriptionInterval.Year]: 9,
        [SubscriptionInterval.Month]: 12,
      },
      [BillingPlanKey.ENTERPRISE]: {
        [SubscriptionInterval.Year]: 19,
        [SubscriptionInterval.Month]: 25,
      },
      [BillingPlanKey.PRO_V2]: {
        [SubscriptionInterval.Year]: 9,
        [SubscriptionInterval.Month]: 12,
      },
      [BillingPlanKey.ORGANIZATION_V2]: {
        [SubscriptionInterval.Year]: 19,
        [SubscriptionInterval.Month]: 25,
      },
    },
  },
  render: (args) => <BillingComparison {...args} />,
} satisfies Meta<typeof SettingsBillingPlanComparisonTable>;

export default meta;
type Story = StoryObj<typeof meta>;

const playBillingPeriodToggle: NonNullable<Story['play']> = async ({
  canvasElement,
  args,
}) => {
  const canvas = within(canvasElement);
  const period = within(
    canvas.getByRole('radiogroup', { name: 'Billing period' }),
  );

  await expect(period.getByRole('radio', { name: 'Annual' })).toBeChecked();
  await expect(canvas.getByText('Save 25% when billed annually')).toBeVisible();
  await userEvent.click(period.getByRole('radio', { name: 'Monthly' }));
  await expect(period.getByRole('radio', { name: 'Monthly' })).toBeChecked();
  await expect(args.onBillingIntervalChange).toHaveBeenLastCalledWith(
    SubscriptionInterval.Month,
  );
  await expect(canvas.getByText('Billed monthly')).toBeVisible();
  await userEvent.keyboard('{ArrowLeft}');
  await expect(period.getByRole('radio', { name: 'Annual' })).toBeChecked();
  await expect(args.onBillingIntervalChange).toHaveBeenLastCalledWith(
    SubscriptionInterval.Year,
  );
  await expect(canvas.getByText('Save 25% when billed annually')).toBeVisible();
};

export const BillingPeriod: Story = {
  play: playBillingPeriodToggle,
};

export const MobileBillingPeriod: Story = {
  parameters: {
    viewport: { defaultViewport: 'mobile1' },
  },
  play: async (context) => {
    const canvas = within(context.canvasElement);
    const periodGroup = canvas.getByRole('radiogroup', {
      name: 'Billing period',
    });
    const headerCell = periodGroup.parentElement;
    const monthlyOption = within(periodGroup).getByRole('radio', {
      name: 'Monthly',
    });

    await expect(headerCell).not.toBeNull();
    await expect(
      monthlyOption.getBoundingClientRect().right,
    ).toBeLessThanOrEqual(headerCell?.getBoundingClientRect().right ?? 0);

    await playBillingPeriodToggle(context);
  },
};
