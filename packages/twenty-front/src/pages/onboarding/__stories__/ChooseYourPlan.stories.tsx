import { getOperationName } from '@apollo/client/utilities';
import { Meta, StoryObj } from '@storybook/react';
import { within } from '@storybook/testing-library';
import { HttpResponse, graphql } from 'msw';

import { AppPath } from '@/types/AppPath';
import { GET_CURRENT_USER } from '@/users/graphql/queries/getCurrentUser';
import { OnboardingStatus } from '~/generated/graphql';
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
                OnboardingStatus.PlanRequired,
              ),
            },
          });
        }),
        graphql.query('GetProductPrices', () => {
          return HttpResponse.json({
            data: {
              getProductPrices: {
                __typename: 'ProductPricesEntity',
                productPrices: [
                  {
                    __typename: 'ProductPriceEntity',
                    created: 1699860608,
                    recurringInterval: 'Month',
                    stripePriceId: 'monthly8usd',
                    unitAmount: 900,
                  },
                  {
                    __typename: 'ProductPriceEntity',
                    created: 1701874964,
                    recurringInterval: 'Year',
                    stripePriceId: 'priceId',
                    unitAmount: 9000,
                  },
                ],
              },
            },
          });
        }),
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
