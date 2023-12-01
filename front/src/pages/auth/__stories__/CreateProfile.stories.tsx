import { getOperationName } from '@apollo/client/utilities';
import { Meta, StoryObj } from '@storybook/react';
import { within } from '@storybook/testing-library';
import { graphql } from 'msw';

import { GET_CLIENT_CONFIG } from '@/client-config/graphql/queries/getClientConfig';
import { AppPath } from '@/types/AppPath';
import {
  PageDecorator,
  PageDecoratorArgs,
} from '~/testing/decorators/PageDecorator';
import { mockedOnboardingUsersData } from '~/testing/mock-data/users';

import { GET_CURRENT_USER } from '../../../modules/users/graphql/queries/getCurrentUser';
import { CreateProfile } from '../CreateProfile';

const meta: Meta<PageDecoratorArgs> = {
  title: 'Pages/Auth/CreateProfile',
  component: CreateProfile,
  decorators: [PageDecorator],
  args: { routePath: AppPath.CreateProfile },
  parameters: {
    msw: [
      graphql.query(
        getOperationName(GET_CURRENT_USER) ?? '',
        (req, res, ctx) => {
          return res(
            ctx.data({
              currentUser: mockedOnboardingUsersData[1],
            }),
          );
        },
      ),
      graphql.query(
        getOperationName(GET_CLIENT_CONFIG) ?? '',
        (req, res, ctx) => {
          return res(
            ctx.data({
              clientConfig: {
                signInPrefilled: true,
                dataModelSettingsEnabled: true,
                developersSettingsEnabled: true,
                debugMode: false,
                authProviders: {
                  google: true,
                  password: true,
                  magicLink: false,
                },
                telemetry: { enabled: false, anonymizationEnabled: true },
                support: {
                  supportDriver: 'front',
                  supportFrontChatId: null,
                },
              },
            }),
          );
        },
      ),
    ],
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
