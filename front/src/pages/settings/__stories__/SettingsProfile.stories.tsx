import type { Meta, StoryObj } from '@storybook/react';
import { within } from '@storybook/testing-library';

import { graphqlMocks } from '~/testing/graphqlMocks';
import { getRenderWrapperForPage } from '~/testing/renderWrappers';

import { SettingsProfile } from '../SettingsProfile';

const meta: Meta<typeof SettingsProfile> = {
  title: 'Pages/Settings/SettingsProfile',
  component: SettingsProfile,
};

export default meta;

export type Story = StoryObj<typeof SettingsProfile>;

export const Default: Story = {
  render: getRenderWrapperForPage(<SettingsProfile />, '/settings/profile'),
  parameters: {
    msw: graphqlMocks,
  },
};

export const LogOut: Story = {
  render: getRenderWrapperForPage(<SettingsProfile />, '/settings/profile'),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const logoutButton = await canvas.findByText('Logout');
    await logoutButton.click();
  },
  parameters: {
    msw: graphqlMocks,
  },
};
