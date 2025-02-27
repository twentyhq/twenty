import { Meta, StoryObj } from '@storybook/react';

import {
  PageDecorator,
  PageDecoratorArgs,
} from '~/testing/decorators/PageDecorator';
import { graphqlMocks } from '~/testing/graphqlMocks';

import { SettingsRoles } from '../SettingsRoles';

const meta: Meta<PageDecoratorArgs> = {
  title: 'Pages/Settings/Roles/SettingsRoles',
  component: SettingsRoles,
  decorators: [PageDecorator],
  args: { routePath: '/settings/roles' },
  parameters: {
    msw: graphqlMocks,
  },
};

export default meta;

export type Story = StoryObj<typeof SettingsRoles>;

export const Default: Story = {};
