import { Meta, StoryObj } from '@storybook/react';

import { SettingsDevelopers } from '~/pages/settings/developers/SettingsDevelopers';
import {
  PageDecorator,
  PageDecoratorArgs,
} from '~/testing/decorators/PageDecorator';
import { graphqlMocks } from '~/testing/graphqlMocks';
import { sleep } from '~/testing/sleep';

const meta: Meta<PageDecoratorArgs> = {
  title: 'Pages/Settings/Developers/SettingsDevelopers',
  component: SettingsDevelopers,
  decorators: [PageDecorator],
  args: { routePath: '/settings/developers' },
  parameters: {
    msw: graphqlMocks,
  },
};

export default meta;

export type Story = StoryObj<typeof SettingsDevelopers>;

export const Default: Story = {
  play: async () => {
    await sleep(100);
  },
};
