import { expect } from '@storybook/jest';
import { Meta, StoryObj } from '@storybook/react';
import { within } from '@storybook/test';

import {
  PageDecorator,
  PageDecoratorArgs,
} from '~/testing/decorators/PageDecorator';
import { graphqlMocks } from '~/testing/graphqlMocks';
import { sleep } from '~/utils/sleep';

import { SettingsWorkspaceMembers } from '../SettingsWorkspaceMembers';

const meta: Meta<PageDecoratorArgs> = {
  title: 'Pages/Settings/SettingsWorkspaceMembers',
  component: SettingsWorkspaceMembers,
  decorators: [PageDecorator],
  args: { routePath: '/settings/members' },
  parameters: {
    msw: graphqlMocks,
  },
};

export default meta;

export type Story = StoryObj<typeof SettingsWorkspaceMembers>;

export const Default: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    await sleep(1000);

    const buttons = await canvas.getAllByRole('button');

    expect(
      buttons.findIndex((button) => button.outerHTML.includes('Copy link')),
    ).toBeGreaterThan(-1);
  },
};
