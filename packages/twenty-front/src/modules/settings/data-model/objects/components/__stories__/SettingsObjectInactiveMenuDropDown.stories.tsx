import { type Decorator, type Meta, type StoryObj } from '@storybook/react';
import { expect, fn, userEvent, within } from '@storybook/test';

import { ComponentDecorator } from 'twenty-ui/testing';
import { I18nFrontDecorator } from '~/testing/decorators/I18nFrontDecorator';
import { SettingsObjectInactiveMenuDropDown } from '@/settings/data-model/objects/components/SettingsObjectInactiveMenuDropDown';

const handleActivateMockFunction = fn();
const handleDeleteMockFunction = fn();

const ClearMocksDecorator: Decorator = (Story, context) => {
  if (context.parameters.clearMocks === true) {
    handleActivateMockFunction.mockClear();
    handleDeleteMockFunction.mockClear();
  }
  return <Story />;
};

const meta: Meta<typeof SettingsObjectInactiveMenuDropDown> = {
  title: 'Modules/Settings/DataModel/SettingsObjectInactiveMenuDropDown',
  component: SettingsObjectInactiveMenuDropDown,
  args: {
    objectMetadataItemNamePlural: 'settings-object-inactive-menu-dropdown',
    onActivate: handleActivateMockFunction,
    onDelete: handleDeleteMockFunction,
  },
  decorators: [I18nFrontDecorator, ComponentDecorator, ClearMocksDecorator],
  parameters: {
    clearMocks: true,
  },
};

export default meta;
type Story = StoryObj<typeof SettingsObjectInactiveMenuDropDown>;

export const Default: Story = {};

export const Open: Story = {
  play: async () => {
    const canvas = within(document.body);

    const dropdownButton = await canvas.findByRole('button', {
      name: 'Inactive Object Options',
    });

    await userEvent.click(dropdownButton);
  },
};

export const WithActivate: Story = {
  play: async () => {
    const canvas = within(document.body);

    const dropdownButton = await canvas.findByRole('button', {
      name: 'Inactive Object Options',
    });

    await userEvent.click(dropdownButton);

    await expect(handleActivateMockFunction).toHaveBeenCalledTimes(0);

    const activateMenuItem = await canvas.findByText('Activate');

    await userEvent.click(activateMenuItem);

    await expect(handleActivateMockFunction).toHaveBeenCalledTimes(1);

    await userEvent.click(dropdownButton);
  },
};

export const WithDelete: Story = {
  args: { isCustomObject: true },
  play: async () => {
    const canvas = within(document.body);

    const dropdownButton = await canvas.findByRole('button', {
      name: 'Inactive Object Options',
    });

    await userEvent.click(dropdownButton);

    await expect(handleDeleteMockFunction).toHaveBeenCalledTimes(0);

    const deleteMenuItem = await canvas.findByText('Delete');

    await userEvent.click(deleteMenuItem);

    await expect(handleDeleteMockFunction).toHaveBeenCalledTimes(1);

    await userEvent.click(dropdownButton);
  },
};
