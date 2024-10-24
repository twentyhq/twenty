import { getOperationName } from '@apollo/client/utilities';
import { Meta, StoryObj } from '@storybook/react';
import { within } from '@storybook/testing-library';
import { HttpResponse, graphql } from 'msw';

import { AppPath } from '@/types/AppPath';
import { GET_CURRENT_USER } from '@/users/graphql/queries/getCurrentUser';
import { OnboardingStatus } from '~/generated/graphql';
import { PaymentSuccess } from '~/pages/onboarding/PaymentSuccess';
import {
  PageDecorator,
  PageDecoratorArgs,
} from '~/testing/decorators/PageDecorator';
import { graphqlMocks } from '~/testing/graphqlMocks';
import { mockedOnboardingUserData } from '~/testing/mock-data/users';

const meta: Meta<PageDecoratorArgs> = {
  title: 'Pages/Onboarding/PaymentSuccess',
  component: PaymentSuccess,
  decorators: [PageDecorator],
  args: { routePath: AppPath.PlanRequiredSuccess },
  parameters: {
    msw: {
      handlers: [
        graphql.query(getOperationName(GET_CURRENT_USER) ?? '', () => {
          return HttpResponse.json({
            data: {
              currentUser: mockedOnboardingUserData(
                OnboardingStatus.WorkspaceActivation,
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
