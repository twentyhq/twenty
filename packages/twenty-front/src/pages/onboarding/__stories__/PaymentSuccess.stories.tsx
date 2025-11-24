import { getOperationName } from '@apollo/client/utilities';
import { type Meta, type StoryObj } from '@storybook/react';
import { within } from '@storybook/test';
import { HttpResponse, graphql } from 'msw';

import { GET_CURRENT_USER } from '@/users/graphql/queries/getCurrentUser';
import { AppPath } from 'twenty-shared/types';
import { OnboardingStatus } from '~/generated/graphql';
import { PaymentSuccess } from '~/pages/onboarding/PaymentSuccess';
import { I18nFrontDecorator } from '~/testing/decorators/I18nFrontDecorator';
import {
  PageDecorator,
  type PageDecoratorArgs,
} from '~/testing/decorators/PageDecorator';
import { graphqlMocks } from '~/testing/graphqlMocks';
import { mockedOnboardingUserData } from '~/testing/mock-data/users';

const meta: Meta<PageDecoratorArgs> = {
  title: 'Pages/Onboarding/PaymentSuccess',
  component: PaymentSuccess,
  decorators: [PageDecorator, I18nFrontDecorator],
  args: { routePath: AppPath.PlanRequiredSuccess },
  parameters: {
    msw: {
      handlers: [
        graphql.query(getOperationName(GET_CURRENT_USER) ?? '', () => {
          return HttpResponse.json({
            data: {
              currentUser: mockedOnboardingUserData(
                OnboardingStatus.WORKSPACE_ACTIVATION,
              ),
            },
          });
        }),
        graphqlMocks.handlers,
      ],
    },
  },
};

export default meta;

export type Story = StoryObj<typeof PaymentSuccess>;

export const Default: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    await canvas.findByText('Start');
  },
};
