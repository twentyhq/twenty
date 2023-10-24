import { Meta, StoryObj } from '@storybook/react';

import {
  PageDecorator,
  PageDecoratorArgs,
} from '~/testing/decorators/PageDecorator';
import { graphqlMocks } from '~/testing/graphqlMocks';

import { SettingsApis } from '../SettingsApis';

const meta: Meta<PageDecoratorArgs> = {
  title: 'Pages/Settings/Api/SettingsApis',
  component: SettingsApis,
  decorators: [PageDecorator],
  args: { routePath: '/settings/developers/api-keys' },
  parameters: {
    msw: graphqlMocks,
  },
};

export default meta;

export type Story = StoryObj<typeof SettingsApis>;

export const Default: Story = {};
