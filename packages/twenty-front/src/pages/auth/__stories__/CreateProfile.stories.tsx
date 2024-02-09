import { getOperationName } from '@apollo/client/utilities';
import { Meta, StoryObj } from '@storybook/react';
import { within } from '@storybook/test';
import { graphql, HttpResponse } from 'msw';

import { AppPath } from '@/types/AppPath';
import { GET_CURRENT_USER_AND_VIEWS } from '@/users/graphql/queries/getCurrentUserAndViews';
import {
  PageDecorator,
  PageDecoratorArgs,
} from '~/testing/decorators/PageDecorator';
import { graphqlMocks } from '~/testing/graphqlMocks';
import { mockedOnboardingUsersData } from '~/testing/mock-data/users';

import { CreateProfile } from '../CreateProfile';

const meta: Meta<PageDecoratorArgs> = {
  title: 'Pages/Auth/CreateProfile',
  component: CreateProfile,
  decorators: [PageDecorator],
  args: { routePath: AppPath.CreateProfile },
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

export type Story = StoryObj<typeof CreateProfile>;

export const Default: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await canvas.findByText('Create profile');
  },
};
