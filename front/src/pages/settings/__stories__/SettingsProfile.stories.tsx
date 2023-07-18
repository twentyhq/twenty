import type { Meta, StoryObj } from '@storybook/react';
import { within } from '@storybook/testing-library';

import { graphqlMocks } from '~/testing/graphqlMocks';
import { mockedUserJWT } from '~/testing/mock-data/jwt';
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
    cookie: {
      tokenPair: `{%22accessToken%22:{%22token%22:%22${mockedUserJWT}%22%2C%22expiresAt%22:%222023-07-18T15:06:40.704Z%22%2C%22__typename%22:%22AuthToken%22}%2C%22refreshToken%22:{%22token%22:%22${mockedUserJWT}%22%2C%22expiresAt%22:%222023-10-15T15:06:41.558Z%22%2C%22__typename%22:%22AuthToken%22}%2C%22__typename%22:%22AuthTokenPair%22}`,
    },
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
