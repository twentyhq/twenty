import { Meta, StoryObj } from '@storybook/react';
import { within } from '@storybook/testing-library';

import {
  PageDecorator,
  PageDecoratorArgs,
} from '~/testing/decorators/PageDecorator';
import { graphqlMocks } from '~/testing/graphqlMocks';
import { sleep } from '~/testing/sleep';

import { SettingsWorkspaceMembers } from '../SettingsWorkspaceMembers';

const meta: Meta<PageDecoratorArgs> = {
  title: 'Pages/Settings/SettingsWorkspaceMembers',
  component: SettingsWorkspaceMembers,
  decorators: [PageDecorator],
  args: { routePath: '/settings/workspace-members' },
  parameters: {
    docs: { story: 'inline', iframeHeight: '500px' },
    msw: graphqlMocks,
  },
};

export default meta;

export type Story = StoryObj<typeof SettingsWorkspaceMembers>;

export const Default: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    await sleep(1000);

    await canvas.getByRole('button', { name: 'Copy link' });
  },
};
