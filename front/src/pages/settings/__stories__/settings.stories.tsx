import type { Meta, StoryObj } from '@storybook/react';

import { graphqlMocks } from '~/testing/graphqlMocks';

import { SettingsProfile } from '../SettingsProfile';

import { render } from './shared';

const meta: Meta<typeof SettingsProfile> = {
  title: 'Pages/Settings/SettingsProfile',
  component: SettingsProfile,
};

export default meta;

export type Story = StoryObj<typeof SettingsProfile>;

export const Default: Story = {
  render,
  parameters: {
    msw: graphqlMocks,
  },
};
