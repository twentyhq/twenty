import { type Meta, type StoryObj } from '@storybook/react';
import { expect, within } from '@storybook/test';

import { SettingsPath } from 'twenty-shared/types';
import {
  PageDecorator,
  type PageDecoratorArgs,
} from '~/testing/decorators/PageDecorator';
import { graphqlMocks } from '~/testing/graphqlMocks';
import { sleep } from '~/utils/sleep';

import { getSettingsPath } from 'twenty-shared/utils';

import { SettingsBilling } from '~/pages/settings/SettingsBilling';
import { WorkspaceDecorator } from '~/testing/decorators/WorkspaceDecorator';

const meta: Meta<PageDecoratorArgs> = {
  title: 'Pages/Settings/SettingsBilling',
  component: SettingsBilling,
  decorators: [WorkspaceDecorator, PageDecorator],
  args: { routePath: getSettingsPath(SettingsPath.Billing) },
  parameters: {
    msw: graphqlMocks,
  },
};

export default meta;

export type Story = StoryObj<typeof SettingsBilling>;

export const Default: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    await sleep(1000);

    const buttons = await canvas.findAllByRole('button');

    expect(
      buttons.findIndex((button) =>
        button.outerHTML.includes('View billing details'),
      ),
    ).toBeGreaterThan(-1);
  },
};
