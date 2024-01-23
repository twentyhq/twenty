import { getOperationName } from '@apollo/client/utilities';
import { Meta, StoryObj } from '@storybook/react';
import { fireEvent, within } from '@storybook/test';
import { graphql, HttpResponse } from 'msw';

import { AppPath } from '@/types/AppPath';
import { GET_CURRENT_USER_AND_VIEWS } from '@/users/graphql/queries/getCurrentUserAndViews';
import {
  PageDecorator,
  PageDecoratorArgs,
} from '~/testing/decorators/PageDecorator';
import { graphqlMocks } from '~/testing/graphqlMocks';
import { mockedOnboardingUsersData } from '~/testing/mock-data/users';

import { SignInUp } from '../SignInUp';

const meta: Meta<PageDecoratorArgs> = {
  title: 'Pages/Auth/SignInUp',
  component: SignInUp,
  decorators: [PageDecorator],
  args: { routePath: AppPath.SignIn },
  parameters: {
    msw: {
      handlers: [
        graphql.query(
          getOperationName(GET_CURRENT_USER_AND_VIEWS) ?? '',
          () => {
            return HttpResponse.json({
              data: {
                currentUser: mockedOnboardingUsersData[0],
              },
            });
          },
        ),
        graphqlMocks.handlers,
      ],
    },
  },
};

export default meta;

export type Story = StoryObj<typeof SignInUp>;

export const Default: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const continueWithEmailButton = await canvas.findByText(
      'Continue With Email',
    );

    await fireEvent.click(continueWithEmailButton);
  },
};
