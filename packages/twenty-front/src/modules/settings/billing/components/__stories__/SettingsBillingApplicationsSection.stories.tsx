import { type Meta, type StoryObj } from '@storybook/react-vite';
import { expect, within } from 'storybook/test';
import { CatalogDecorator, ComponentDecorator } from 'twenty-ui/testing';

import { SettingsBillingApplicationsSection } from '@/settings/billing/components/SettingsBillingApplicationsSection';

const APPLICATION_SUBSCRIPTION_ITEMS = [
  {
    id: 'linkedin',
    quantity: 3,
    unitAmount: 700,
    billingProduct: {
      name: 'LinkedIn - Per connected account',
      metadata: {
        applicationName: 'LinkedIn',
        applicationPricePer: 'CONNECTED_ACCOUNT',
      },
    },
  },
  {
    id: 'slack',
    quantity: 4,
    unitAmount: 200,
    billingProduct: {
      name: 'Slack - Per member',
      metadata: {
        applicationName: 'Slack',
        applicationPricePer: 'WORKSPACE_MEMBER',
      },
    },
  },
  {
    id: 'legacy',
    quantity: 1,
    unitAmount: 500,
    billingProduct: {
      name: 'Legacy app - Flat fee',
      metadata: {},
    },
  },
];

const YEARLY_APPLICATION_SUBSCRIPTION_ITEMS =
  APPLICATION_SUBSCRIPTION_ITEMS.map((applicationSubscriptionItem) => ({
    ...applicationSubscriptionItem,
    unitAmount: applicationSubscriptionItem.unitAmount * 12,
  }));

const meta: Meta<typeof SettingsBillingApplicationsSection> = {
  title: 'Modules/Settings/Billing/SettingsBillingApplicationsSection',
  component: SettingsBillingApplicationsSection,
  decorators: [ComponentDecorator],
  args: {
    applicationSubscriptionItems: APPLICATION_SUBSCRIPTION_ITEMS,
    applicationsCount: 3,
    isYearlyPlan: false,
  },
};

export default meta;

type Story = StoryObj<typeof SettingsBillingApplicationsSection>;

export const Monthly: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    expect(await canvas.findByText('3 paid apps')).toBeVisible();
    expect(await canvas.findByText('LinkedIn')).toBeVisible();
    expect(await canvas.findByText('3 accounts × $7 ·')).toBeVisible();
    expect(await canvas.findByText('$21')).toBeVisible();
    expect(await canvas.findByText('Legacy app - Flat fee')).toBeVisible();
  },
};

export const Yearly: Story = {
  args: {
    applicationSubscriptionItems: YEARLY_APPLICATION_SUBSCRIPTION_ITEMS,
    isYearlyPlan: true,
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    expect(await canvas.findByText('4 members × $2 ·')).toBeVisible();
    expect(await canvas.findByText('$8')).toBeVisible();
  },
};

export const Catalog: Story = {
  decorators: [CatalogDecorator],
  parameters: {
    catalog: {
      dimensions: [
        {
          name: 'interval',
          values: ['monthly', 'yearly'],
          props: (interval: string) =>
            interval === 'yearly'
              ? {
                  applicationSubscriptionItems:
                    YEARLY_APPLICATION_SUBSCRIPTION_ITEMS,
                  isYearlyPlan: true,
                }
              : {},
        },
        {
          name: 'items',
          values: ['paid apps', 'none'],
          props: (items: string) =>
            items === 'none'
              ? { applicationSubscriptionItems: [], applicationsCount: 0 }
              : {},
        },
      ],
    },
  },
};
