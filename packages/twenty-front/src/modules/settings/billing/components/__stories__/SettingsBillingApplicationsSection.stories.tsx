import { type Meta, type StoryObj } from '@storybook/react-vite';
import { HttpResponse } from 'msw';
import { expect, within } from 'storybook/test';
import { CatalogDecorator, ComponentDecorator } from 'twenty-ui/testing';

import { SettingsBillingApplicationsSection } from '@/settings/billing/components/SettingsBillingApplicationsSection';
import { metadataGraphql } from '~/testing/graphqlMocks';

const APPLICATION_REGISTRATIONS = [
  {
    universalIdentifier: 'linkedin-app',
    name: 'LinkedIn',
    priceUniversalIdentifier: 'linkedin-per-account',
    per: 'CONNECTED_ACCOUNT',
  },
  {
    universalIdentifier: 'slack-app',
    name: 'Slack',
    priceUniversalIdentifier: 'slack-per-member',
    per: 'WORKSPACE_MEMBER',
  },
];

const APPLICATION_SUBSCRIPTION_ITEMS = [
  {
    id: 'linkedin',
    quantity: 3,
    unitAmount: 700,
    billingProduct: {
      name: 'LinkedIn - Per connected account',
      metadata: {
        applicationUniversalIdentifier: 'linkedin-app',
        applicationPriceUniversalIdentifier: 'linkedin-per-account',
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
        applicationUniversalIdentifier: 'slack-app',
        applicationPriceUniversalIdentifier: 'slack-per-member',
      },
    },
  },
  {
    id: 'unregistered',
    quantity: 1,
    unitAmount: 500,
    billingProduct: {
      name: 'Unregistered app - Flat fee',
      metadata: {
        applicationUniversalIdentifier: 'unregistered-app',
        applicationPriceUniversalIdentifier: 'unregistered-flat-fee',
      },
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
  parameters: {
    msw: {
      handlers: [
        metadataGraphql.query(
          'FindApplicationRegistrationByUniversalIdentifier',
          ({ variables }) => {
            const applicationRegistration = APPLICATION_REGISTRATIONS.find(
              ({ universalIdentifier }) =>
                universalIdentifier === variables.universalIdentifier,
            );

            return HttpResponse.json({
              data: {
                findApplicationRegistrationByUniversalIdentifier:
                  applicationRegistration
                    ? {
                        __typename: 'ApplicationRegistration',
                        id: applicationRegistration.universalIdentifier,
                        name: applicationRegistration.name,
                        logoUrl: null,
                        billingPrices: [
                          {
                            __typename: 'ApplicationBillingPrice',
                            universalIdentifier:
                              applicationRegistration.priceUniversalIdentifier,
                            per: applicationRegistration.per,
                          },
                        ],
                      }
                    : null,
              },
            });
          },
        ),
      ],
    },
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
    expect(
      await canvas.findByText('Unregistered app - Flat fee'),
    ).toBeVisible();
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
