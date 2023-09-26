import { Meta, StoryObj } from '@storybook/react';

import {
  PageDecorator,
  type PageDecoratorArgs,
} from '~/testing/decorators/PageDecorator';
import { graphqlMocks } from '~/testing/graphqlMocks';

import { SettingsWorkspace } from '../SettingsWorkspace';

const meta: Meta<PageDecoratorArgs> = {
  title: 'Pages/Settings/SettingsWorkspace',
  component: SettingsWorkspace,
  decorators: [PageDecorator],
  args: { routePath: '/settings/workspace' },
  parameters: {
    docs: { story: 'inline', iframeHeight: '500px' },
    msw: graphqlMocks,
  },
};

export default meta;

export type Story = StoryObj<typeof SettingsWorkspace>;

export const Default: Story = {};
