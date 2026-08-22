import { type Meta, type StoryObj } from '@storybook/react-vite';
import { expect, within } from 'storybook/test';

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

export const SelectFieldWithOptionAddedFromRecord: Story = {
  args: {
    routeParams: {
      ':objectNamePlural': 'opportunities',
      ':fieldName': 'stage',
    },
    searchParams: { newOption: 'Negotiation' },
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    await canvas.findByDisplayValue('Negotiation');

    const saveButton = await canvas.findByRole('button', { name: /Save/ });

    await expect(saveButton).toBeEnabled();
  },
};
