import { Meta, StoryObj } from '@storybook/react';

import { SettingsDevelopersWebhooks } from '~/pages/settings/developers/SettingsDevelopersWebhooks';
import {
  PageDecorator,
  PageDecoratorArgs,
} from '~/testing/decorators/PageDecorator';
import { graphqlMocks } from '~/testing/graphqlMocks';
import { sleep } from '~/testing/sleep';

const meta: Meta<PageDecoratorArgs> = {
  title: 'Pages/Settings/Developers/SettingsDevelopersWebhooks',
  component: SettingsDevelopersWebhooks,
  decorators: [PageDecorator],
  args: { routePath: '/settings/developers' },
  parameters: {
    msw: graphqlMocks,
  },
};

export default meta;

export type Story = StoryObj<typeof SettingsDevelopersWebhooks>;

export const Default: Story = {
  play: async () => {
    await sleep(100);
  },
};
