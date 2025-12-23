import { type Meta, type StoryObj } from '@storybook/react';

import {
  PageDecorator,
  type PageDecoratorArgs,
} from '~/testing/decorators/PageDecorator';
import { graphqlMocks } from '~/testing/graphqlMocks';

import { SettingsRoleEdit } from '~/pages/settings/roles/SettingsRoleEdit';

const meta: Meta<PageDecoratorArgs> = {
  title: 'Pages/Settings/Roles/SettingsRoleEdit',
  component: SettingsRoleEdit,
  decorators: [PageDecorator],
  args: {
    routePath: '/settings/roles/:roleId',
    routeParams: {
      ':roleId': '1',
    },
  },
  parameters: {
    msw: graphqlMocks,
  },
};

export default meta;

export type Story = StoryObj<typeof SettingsRoleEdit>;

export const Default: Story = {};
