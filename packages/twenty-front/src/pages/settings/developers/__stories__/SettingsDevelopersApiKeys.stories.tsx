import { Meta, StoryObj } from '@storybook/react';

import { SettingsDevelopersApiKeys } from '~/pages/settings/developers/SettingsDevelopersApiKeys';
import {
  PageDecorator,
  PageDecoratorArgs,
} from '~/testing/decorators/PageDecorator';
import { graphqlMocks } from '~/testing/graphqlMocks';
import { sleep } from '~/testing/sleep';

const meta: Meta<PageDecoratorArgs> = {
  title: 'Pages/Settings/Developers/ApiKeys/SettingsDevelopersApiKeys',
  component: SettingsDevelopersApiKeys,
  decorators: [PageDecorator],
  args: { routePath: '/settings/developers' },
  parameters: {
    msw: graphqlMocks,
  },
};

export default meta;

export type Story = StoryObj<typeof SettingsDevelopersApiKeys>;

export const Default: Story = {
  play: async () => {
    await sleep(100);
  },
};
