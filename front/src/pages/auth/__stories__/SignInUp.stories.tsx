import { getOperationName } from '@apollo/client/utilities';
import type { Meta, StoryObj } from '@storybook/react';
import { graphql } from 'msw';

import { getRenderWrapperForSignInUp } from '~/testing/renderWrappers';

import { GET_CLIENT_CONFIG } from '../../../modules/client-config/queries';
import { GET_CURRENT_USER } from '../../../modules/users/queries';
import { mockedOnboardingUsersData } from '../../../testing/mock-data/users';
import { SignInUp } from '../SignInUp';

const meta: Meta<typeof SignInUp> = {
  title: 'Pages/Auth/SignInUp',
  component: SignInUp,
};

export default meta;

export type Story = StoryObj<typeof SignInUp>;

export const Default: Story = {
  render: getRenderWrapperForSignInUp(<SignInUp />, '/sign-in'),
  parameters: {
    cookie: {
      tokenPair: '{}',
    },
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
                demoMode: true,
                debugMode: false,
                authProviders: {
                  google: true,
                  password: true,
                  magicLink: false,
                },
                telemetry: { enabled: false, anonymizationEnabled: true },
              },
            }),
          );
        },
      ),
    ],
  },
};
