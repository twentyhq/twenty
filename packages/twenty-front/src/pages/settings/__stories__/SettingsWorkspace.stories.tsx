import { Meta, StoryObj } from '@storybook/react';

import {
  PageDecorator,
  PageDecoratorArgs,
} from '~/testing/decorators/PageDecorator';
import { graphqlMocks } from '~/testing/graphqlMocks';

import { SettingsWorkspace } from '../SettingsWorkspace';

const meta: Meta<PageDecoratorArgs> = {
  title: 'Pages/Settings/SettingsWorkspace',
  component: SettingsWorkspace,
  decorators: [PageDecorator],
  args: { routePath: '/settings/general' },
  parameters: {
    msw: graphqlMocks,
  },
};

export default meta;

export type Story = StoryObj<typeof SettingsWorkspace>;

export const Default: Story = {};
