import { getOperationName } from '@apollo/client/utilities';
import type { Meta, StoryObj } from '@storybook/react';
import { graphql } from 'msw';

import { getRenderWrapperForPage } from '~/testing/renderWrappers';

import { GET_CURRENT_USER } from '../../../modules/users/queries';
import { mockedOnboardingUsersData } from '../../../testing/mock-data/users';
import { CreateProfile } from '../CreateProfile';

const meta: Meta<typeof CreateProfile> = {
  title: 'Pages/Auth/CreateProfile',
  component: CreateProfile,
};

export default meta;

export type Story = StoryObj<typeof CreateProfile>;

export const Default: Story = {
  render: getRenderWrapperForPage(<CreateProfile />, '/create/profile'),
  parameters: {
    msw: [
      graphql.query(
        getOperationName(GET_CURRENT_USER) ?? '',
        (req, res, ctx) => {
          return res(
            ctx.data({
              currentUser: mockedOnboardingUsersData[0],
            }),
          );
        },
      ),
    ],
  },
};
