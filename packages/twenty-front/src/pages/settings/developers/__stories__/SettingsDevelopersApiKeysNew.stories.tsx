import { Meta, StoryObj } from '@storybook/react';

import { SettingsDevelopersApiKeysNew } from '~/pages/settings/developers/SettingsDevelopersApiKeysNew';
import {
  PageDecorator,
  PageDecoratorArgs,
} from '~/testing/decorators/PageDecorator';
import { graphqlMocks } from '~/testing/graphqlMocks';
import { sleep } from '~/testing/sleep';

const meta: Meta<PageDecoratorArgs> = {
  title: 'Pages/Settings/Developers/ApiKeys/SettingsDevelopersApiKeysNew',
  component: SettingsDevelopersApiKeysNew,
  decorators: [PageDecorator],
  args: { routePath: '/settings/developers/api-keys/new' },
  parameters: {
    msw: graphqlMocks,
  },
};

export default meta;

export type Story = StoryObj<typeof SettingsDevelopersApiKeysNew>;

export const Default: Story = {
  play: async () => {
    await sleep(100);
  },
};
