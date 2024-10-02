import { Meta, StoryObj } from '@storybook/react';
import { userEvent, within } from '@storybook/test';

import {
  PageDecorator,
  PageDecoratorArgs,
} from '~/testing/decorators/PageDecorator';
import { graphqlMocks } from '~/testing/graphqlMocks';

import { SettingsObjectNewField } from '../../SettingsObjectNewField/SettingsObjectNewField';

const meta: Meta<PageDecoratorArgs> = {
  title:
    'Pages/Settings/DataModel/SettingsObjectNewField/SettingsObjectNewField',
  component: SettingsObjectNewField,
  decorators: [PageDecorator],
  args: {
    routePath: '/settings/objects/:objectSlug/new-field',
    routeParams: { ':objectSlug': 'companies' },
  },
  parameters: {
    msw: graphqlMocks,
  },
};

export default meta;

export type Story = StoryObj<typeof SettingsObjectNewField>;

export const Default: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await canvas.findByText('Objects');
    await canvas.findByText('1. Select a field type');

    const searchInput = await canvas.findByPlaceholderText('Search a type');

    await userEvent.type(searchInput, 'Num');

    const numberTypeButton = await canvas.findByText('Number');

    await userEvent.click(numberTypeButton);

    await canvas.findByText('2. Configure field');

    const employeeInput = await canvas.findByPlaceholderText('Employees');
    await userEvent.type(employeeInput, 'Test');

    const descriptionInput = await canvas.findByPlaceholderText(
      'Write a description',
    );

    await userEvent.type(descriptionInput, 'Test description');

    const saveButton = await canvas.findByText('Save');

    await userEvent.click(saveButton);
  },
};
