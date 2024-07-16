import { Meta, StoryObj } from '@storybook/react';
import { within } from '@storybook/test';

import { getSettingsPagePath } from '@/settings/utils/getSettingsPagePath';
import { SettingsPath } from '@/types/SettingsPath';
import {
  PageDecorator,
  PageDecoratorArgs,
} from '~/testing/decorators/PageDecorator';
import { graphqlMocks } from '~/testing/graphqlMocks';
import { sleep } from '~/utils/sleep';

import { SettingsBilling } from '../SettingsBilling';

const meta: Meta<PageDecoratorArgs> = {
  title: 'Pages/Settings/SettingsBilling',
  component: SettingsBilling,
  decorators: [PageDecorator],
  args: { routePath: getSettingsPagePath(SettingsPath.Billing) },
  parameters: {
    msw: graphqlMocks,
  },
};

export default meta;

export type Story = StoryObj<typeof SettingsBilling>;

export const Default: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    sleep(1000);

    await canvas.findByRole('button', { name: 'View billing details' });
  },
};
