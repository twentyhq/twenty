import { Meta, StoryObj } from '@storybook/react';

import {
  PageDecorator,
  PageDecoratorArgs,
} from '~/testing/decorators/PageDecorator';
import { graphqlMocks } from '~/testing/graphqlMocks';

import { SettingsNewObject } from '../SettingsNewObject';

const meta: Meta<PageDecoratorArgs> = {
  title: 'Pages/Settings/SettingsNewObject',
  component: SettingsNewObject,
  decorators: [PageDecorator],
  args: {
    routePath: '/settings/objects/new',
  },
  parameters: {
    docs: { story: 'inline', iframeHeight: '500px' },
    msw: graphqlMocks,
  },
};

export default meta;

export type Story = StoryObj<typeof SettingsNewObject>;

export const Default: Story = {};
