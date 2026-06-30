import { type Meta, type StoryObj } from '@storybook/react-vite';

import {
  PageDecorator,
  type PageDecoratorArgs,
} from '~/testing/decorators/PageDecorator';
import { graphqlMocks } from '~/testing/graphqlMocks';

import { SettingsGeneral } from '~/pages/settings/general/SettingsGeneral';

const meta: Meta<PageDecoratorArgs> = {
  title: 'Pages/Settings/SettingsGeneral',
  component: SettingsGeneral,
  decorators: [PageDecorator],
  args: { routePath: '/settings/general' },
  parameters: {
    msw: graphqlMocks,
  },
};

export default meta;

export type Story = StoryObj<typeof SettingsGeneral>;

export const Default: Story = {};
