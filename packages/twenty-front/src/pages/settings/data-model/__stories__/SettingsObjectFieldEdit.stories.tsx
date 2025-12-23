import { type Meta, type StoryObj } from '@storybook/react';

import {
  PageDecorator,
  type PageDecoratorArgs,
} from '~/testing/decorators/PageDecorator';
import { graphqlMocks } from '~/testing/graphqlMocks';

import { SettingsObjectFieldEdit } from '~/pages/settings/data-model/SettingsObjectFieldEdit';

const meta: Meta<PageDecoratorArgs> = {
  title: 'Pages/Settings/DataModel/SettingsObjectFieldEdit',
  component: SettingsObjectFieldEdit,
  decorators: [PageDecorator],
  args: {
    routePath: '/settings/objects/:objectNamePlural/:fieldName',
    routeParams: { ':objectNamePlural': 'companies', ':fieldName': 'name' },
  },
  parameters: {
    msw: graphqlMocks,
  },
};

export default meta;

export type Story = StoryObj<typeof SettingsObjectFieldEdit>;

export const StandardField: Story = {};

export const CustomField: Story = {
  args: {
    routeParams: {
      ':objectNamePlural': 'companies',
      ':fieldName': 'employees',
    },
  },
};
