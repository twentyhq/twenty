import { Meta, StoryObj } from '@storybook/react';

import {
  PageDecorator,
  PageDecoratorArgs,
} from '~/testing/decorators/PageDecorator';
import { graphqlMocks } from '~/testing/graphqlMocks';

import { SettingsNewApi } from '../SettingsNewApi';

const meta: Meta<PageDecoratorArgs> = {
  title: 'Pages/Settings/Api/SettingsNewApi',
  component: SettingsNewApi,
  decorators: [PageDecorator],
  args: { routePath: '/settings/apis/new' },
  parameters: {
    msw: graphqlMocks,
  },
};

export default meta;

export type Story = StoryObj<typeof SettingsNewApi>;

export const Default: Story = {};
