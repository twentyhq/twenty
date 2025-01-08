import { Meta, StoryObj } from '@storybook/react';
import { userEvent, within } from '@storybook/test';
import { SettingsObjectNewFieldConfigure } from '~/pages/settings/data-model/SettingsObjectNewField/SettingsObjectNewFieldConfigure';

import {
  PageDecorator,
  PageDecoratorArgs,
} from '~/testing/decorators/PageDecorator';
import { graphqlMocks } from '~/testing/graphqlMocks';

const meta: Meta<PageDecoratorArgs> = {
  title:
    'Pages/Settings/DataModel/SettingsObjectNewField/SettingsObjectNewFieldConfigure',
  component: SettingsObjectNewFieldConfigure,
  decorators: [PageDecorator],
  args: {
    routePath: '/settings/objects/:objectNamePlural/new-field/configure',
    routeParams: { ':objectNamePlural': 'companies' },
  },
  parameters: {
    msw: graphqlMocks,
  },
};

export default meta;

export type Story = StoryObj<typeof SettingsObjectNewFieldConfigure>;

export const Default: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    await canvas.findByText('2. Configure field');

    const employeeInput = await canvas.findByPlaceholderText('Employees');
    await userEvent.type(employeeInput, 'Test');

    const descriptionInput = await canvas.findByPlaceholderText(
      'Write a description',
    );
    await userEvent.type(descriptionInput, 'Test description');

    const saveButton = await canvas.findByText('Save');
    await new Promise((resolve) => setTimeout(resolve, 5000));
    await userEvent.click(saveButton);
  },
};
