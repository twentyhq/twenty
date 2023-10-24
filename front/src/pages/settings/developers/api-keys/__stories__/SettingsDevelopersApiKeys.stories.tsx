import { Meta, StoryObj } from '@storybook/react';

import { SettingsDevelopersApiKeys } from '~/pages/settings/developers/api-keys/SettingsDevelopersApiKeys';
import {
  PageDecorator,
  PageDecoratorArgs,
} from '~/testing/decorators/PageDecorator';
import { graphqlMocks } from '~/testing/graphqlMocks';

const meta: Meta<PageDecoratorArgs> = {
  title: 'Pages/Settings/Developpers/ApiKeys/SettingsDevelopersApiKeys',
  component: SettingsDevelopersApiKeys,
  decorators: [PageDecorator],
  args: { routePath: '/settings/developers/api-keys' },
  parameters: {
    msw: graphqlMocks,
  },
};

export default meta;

export type Story = StoryObj<typeof SettingsDevelopersApiKeys>;

export const Default: Story = {};
