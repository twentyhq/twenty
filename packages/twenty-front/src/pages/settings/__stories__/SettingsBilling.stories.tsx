import { Meta, StoryObj } from '@storybook/react';
import { within } from '@storybook/test';

import { SettingsPath } from '@/types/SettingsPath';
import {
  PageDecorator,
  PageDecoratorArgs,
} from '~/testing/decorators/PageDecorator';
import { graphqlMocks } from '~/testing/graphqlMocks';
import { sleep } from '~/utils/sleep';

import { getSettingsPath } from '~/utils/navigation/getSettingsPath';
import { SettingsBilling } from '../SettingsBilling';

const meta: Meta<PageDecoratorArgs> = {
  title: 'Pages/Settings/SettingsBilling',
  component: SettingsBilling,
  decorators: [PageDecorator],
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
    sleep(1000);

    await canvas.findByRole('button', { name: 'View billing details' });
  },
};
