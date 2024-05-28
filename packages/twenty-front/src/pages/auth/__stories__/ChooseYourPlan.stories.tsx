import { getOperationName } from '@apollo/client/utilities';
import { Meta, StoryObj } from '@storybook/react';
import { within } from '@storybook/testing-library';
import { graphql, HttpResponse } from 'msw';

import { AppPath } from '@/types/AppPath';
import { GET_CURRENT_USER } from '@/users/graphql/queries/getCurrentUser';
import {
  PageDecorator,
  PageDecoratorArgs,
} from '~/testing/decorators/PageDecorator';
import { PrefetchLoadingDecorator } from '~/testing/decorators/PrefetchLoadingDecorator';
import { graphqlMocks } from '~/testing/graphqlMocks';
import { mockedOnboardingUsersData } from '~/testing/mock-data/users';
import { sleep } from '~/testing/sleep';

import { ChooseYourPlan } from '../ChooseYourPlan';

const meta: Meta<PageDecoratorArgs> = {
  title: 'Pages/Auth/ChooseYourPlan',
  component: ChooseYourPlan,
  decorators: [PrefetchLoadingDecorator, PageDecorator],
  args: { routePath: AppPath.PlanRequired },
  parameters: {
    msw: {
      handlers: [
        graphql.query(getOperationName(GET_CURRENT_USER) ?? '', () => {
          return HttpResponse.json({
            data: {
              currentUser: mockedOnboardingUsersData[0],
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
                    recurringInterval: 'month',
                    stripePriceId: 'monthly8usd',
                    unitAmount: 900,
                  },
                  {
                    __typename: 'ProductPriceEntity',
                    created: 1701874964,
                    recurringInterval: 'year',
                    stripePriceId: 'priceId',
                    unitAmount: 9000,
                  },
                ],
              },
            },
          });
        }),
        graphqlMocks.handlers,
      ],
    },
  },
};

export default meta;

export type Story = StoryObj<typeof ChooseYourPlan>;

export const Default: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    sleep(100);

    await canvas.findByText('Choose your Plan');
  },
};
