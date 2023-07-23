import type { Meta, StoryObj } from '@storybook/react';

import { graphqlMocks } from '~/testing/graphqlMocks';
import { getRenderWrapperForPage } from '~/testing/renderWrappers';

import { CreateProfile } from '../CreateProfile';

const meta: Meta<typeof CreateProfile> = {
  title: 'Pages/Auth/CreateProfile',
  component: CreateProfile,
};

export default meta;

export type Story = StoryObj<typeof CreateProfile>;

export const Default: Story = {
  render: getRenderWrapperForPage(<CreateProfile />, '/auth/create-profile'),
  parameters: {
    msw: graphqlMocks,
  },
};
