import { Meta, StoryObj } from '@storybook/react';

import {
  PageDecorator,
  PageDecoratorArgs,
} from '~/testing/decorators/PageDecorator';
import { graphqlMocks } from '~/testing/graphqlMocks';

import { SettingsAppearance } from '../SettingsAppearance';

const meta: Meta<PageDecoratorArgs> = {
  title: 'Pages/Settings/SettingsAppearance',
  component: SettingsAppearance,
  decorators: [PageDecorator],
  args: { routePath: '/settings/appearance' },
  parameters: {
    msw: graphqlMocks,
  },
};

export default meta;

export type Story = StoryObj<typeof SettingsAppearance>;

export const Default: Story = {};
