import { getOperationName } from '@apollo/client/utilities';
import type { Meta, StoryObj } from '@storybook/react';
import { within } from '@storybook/testing-library';
import { graphql } from 'msw';

import { getRenderWrapperForPage } from '~/testing/renderWrappers';

import { GET_CURRENT_USER } from '../../../modules/users/queries';
import { mockedOnboardingUsersData } from '../../../testing/mock-data/users';
import { CreateWorkspace } from '../CreateWorkspace';

const meta: Meta<typeof CreateWorkspace> = {
  title: 'Pages/Auth/CreateWorkspace',
  component: CreateWorkspace,
};

export default meta;

export type Story = StoryObj<typeof CreateWorkspace>;

export const Default: Story = {
  render: getRenderWrapperForPage(<CreateWorkspace />, '/create/workspace'),
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
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await canvas.findByText('Create your workspace');
  },
};
