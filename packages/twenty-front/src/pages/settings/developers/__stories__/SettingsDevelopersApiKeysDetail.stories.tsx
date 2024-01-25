import { Meta, StoryObj } from '@storybook/react';

import { SettingsDevelopersApiKeyDetail } from '~/pages/settings/developers/SettingsDevelopersApiKeyDetail';
import {
  PageDecorator,
  PageDecoratorArgs,
} from '~/testing/decorators/PageDecorator';
import { graphqlMocks } from '~/testing/graphqlMocks';
import { sleep } from '~/testing/sleep';

const meta: Meta<PageDecoratorArgs> = {
  title: 'Pages/Settings/Developers/ApiKeys/SettingsDevelopersApiKeyDetail',
  component: SettingsDevelopersApiKeyDetail,
  decorators: [PageDecorator],
  args: {
    routePath: '/settings/apis/f7c6d736-8fcd-4e9c-ab99-28f6a9031570',
  },
  parameters: {
    msw: graphqlMocks,
  },
};
export default meta;

export type Story = StoryObj<typeof SettingsDevelopersApiKeyDetail>;

export const Default: Story = {
  play: async () => {
    await sleep(100);
  },
};
