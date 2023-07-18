import type { Meta, StoryObj } from '@storybook/react';

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
