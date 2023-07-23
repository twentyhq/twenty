import type { Meta, StoryObj } from '@storybook/react';
import { within } from '@storybook/testing-library';

import { graphqlMocks } from '~/testing/graphqlMocks';
import { getRenderWrapperForPage } from '~/testing/renderWrappers';

import { SettingsWorkspaceMembers } from '../SettingsWorkspaceMembers';

const meta: Meta<typeof SettingsWorkspaceMembers> = {
  title: 'Pages/Settings/SettingsWorkspaceMembers',
  component: SettingsWorkspaceMembers,
};

export default meta;

export type Story = StoryObj<typeof SettingsWorkspaceMembers>;

export const Default: Story = {
  render: getRenderWrapperForPage(
    <SettingsWorkspaceMembers />,
    '/settings/workspace-members',
  ),
  parameters: {
    msw: graphqlMocks,
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await canvas.findByText('Copy link');
  },
};
