import { getOperationName } from '@apollo/client/utilities';
import { Meta, StoryObj } from '@storybook/react';
import { within } from '@storybook/testing-library';
import { HttpResponse, graphql } from 'msw';

import { BILLING_BASE_PRODUCT_PRICES } from '@/billing/graphql/queries/billingBaseProductPrices';
import { AppPath } from '@/types/AppPath';
import { GET_CURRENT_USER } from '@/users/graphql/queries/getCurrentUser';
import {
  BillingPlanKey,
  OnboardingStatus,
  SubscriptionInterval,
} from '~/generated/graphql';
import { ChooseYourPlan } from '~/pages/onboarding/ChooseYourPlan';
import {
  PageDecorator,
  PageDecoratorArgs,
} from '~/testing/decorators/PageDecorator';
import { graphqlMocks } from '~/testing/graphqlMocks';
import { mockedOnboardingUserData } from '~/testing/mock-data/users';

const meta: Meta<PageDecoratorArgs> = {
  title: 'Pages/Onboarding/ChooseYourPlan',
  component: ChooseYourPlan,
  decorators: [PageDecorator],
  args: { routePath: AppPath.PlanRequired },
  parameters: {
    msw: {
      handlers: [
        graphql.query(getOperationName(GET_CURRENT_USER) ?? '', () => {
          return HttpResponse.json({
            data: {
              currentUser: mockedOnboardingUserData(
                OnboardingStatus.PLAN_REQUIRED,
              ),
            },
          });
        }),
        graphql.query(
          getOperationName(BILLING_BASE_PRODUCT_PRICES) ?? '',
          () => {
            return HttpResponse.json({
              data: {
                plans: [
                  {
                    planKey: BillingPlanKey.PRO,
                    baseProduct: {
                      prices: [
                        {
                          __typename: 'BillingPriceLicensedDTO',
                          unitAmount: 900,
                          stripePriceId: 'monthly8usd',
                          recurringInterval: SubscriptionInterval.Month,
                        },
                      ],
                    },
                  },
                ],
              },
            });
          },
        ),
        ...graphqlMocks.handlers,
      ],
    },
  },
};

export default meta;

export type Story = StoryObj<typeof ChooseYourPlan>;

export const Default: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    await canvas.findByText('Choose your Trial', undefined, {
      timeout: 3000,
    });
  },
};
