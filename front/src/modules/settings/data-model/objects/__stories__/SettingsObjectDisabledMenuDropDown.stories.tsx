import { Decorator, Meta, StoryObj } from '@storybook/react';
import { expect, fn, userEvent, within } from '@storybook/test';

import { ComponentDecorator } from '~/testing/decorators/ComponentDecorator';

import { SettingsObjectDisabledMenuDropDown } from '../SettingsObjectDisabledMenuDropDown';

const handleActivateMockFunction = fn();
const handleEraseMockFunction = fn();

const ClearMocksDecorator: Decorator = (Story, context) => {
  if (context.parameters.clearMocks) {
    handleActivateMockFunction.mockClear();
    handleEraseMockFunction.mockClear();
  }
  return <Story />;
};

const meta: Meta<typeof SettingsObjectDisabledMenuDropDown> = {
  title: 'Modules/Settings/DataModel/SettingsObjectDisabledMenuDropDown',
  component: SettingsObjectDisabledMenuDropDown,
  args: {
    scopeKey: 'settings-object-disabled-menu-dropdown',
    onActivate: handleActivateMockFunction,
    onErase: handleEraseMockFunction,
  },
  decorators: [ComponentDecorator, ClearMocksDecorator],
  parameters: {
    clearMocks: true,
  },
};

export default meta;
type Story = StoryObj<typeof SettingsObjectDisabledMenuDropDown>;

export const Default: Story = {};

export const Open: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    const dropdownButton = await canvas.getByRole('button');

    await userEvent.click(dropdownButton);
  },
};

export const WithActivate: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    const dropdownButton = await canvas.getByRole('button');

    await userEvent.click(dropdownButton);

    await expect(handleActivateMockFunction).toHaveBeenCalledTimes(0);

    const activateMenuItem = await canvas.getByText('Activate');

    await userEvent.click(activateMenuItem);

    await expect(handleActivateMockFunction).toHaveBeenCalledTimes(1);

    await userEvent.click(dropdownButton);
  },
};

export const WithErase: Story = {
  args: { isCustomObject: true },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    const dropdownButton = await canvas.getByRole('button');

    await userEvent.click(dropdownButton);

    await expect(handleEraseMockFunction).toHaveBeenCalledTimes(0);

    const eraseMenuItem = await canvas.getByText('Erase');

    await userEvent.click(eraseMenuItem);

    await expect(handleEraseMockFunction).toHaveBeenCalledTimes(1);

    await userEvent.click(dropdownButton);
  },
};
