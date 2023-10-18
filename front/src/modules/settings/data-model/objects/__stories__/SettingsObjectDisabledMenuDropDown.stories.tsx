import { expect } from '@storybook/jest';
import { jest } from '@storybook/jest';
import { Decorator, Meta, StoryObj } from '@storybook/react';
import { userEvent, within } from '@storybook/testing-library';

import { ComponentDecorator } from '~/testing/decorators/ComponentDecorator';

import { SettingsObjectDisabledMenuDropDown } from '../SettingsObjectDisabledMenuDropDown';

const handleActivateMockFunction = jest.fn();
const handleEraseMockFunction = jest.fn();

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
    handleActivate: handleActivateMockFunction,
    handleErase: handleEraseMockFunction,
  },
  decorators: [ComponentDecorator, ClearMocksDecorator],
  parameters: {
    clearMocks: true,
  },
};

export default meta;
type Story = StoryObj<typeof SettingsObjectDisabledMenuDropDown>;

export const Default: Story = {};

export const WithOpen: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    const dropdownButton = await canvas.findByRole('button');

    await userEvent.click(dropdownButton);
  },
};

export const WithActivate: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    const dropdownButton = await canvas.findByRole('button');

    await userEvent.click(dropdownButton);

    await expect(handleActivateMockFunction).toHaveBeenCalledTimes(0);

    const activateMenuItem = await canvas.findByText('Activate');

    await userEvent.click(activateMenuItem);

    await expect(handleActivateMockFunction).toHaveBeenCalledTimes(1);
  },
};

export const WithErase: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    const dropdownButton = await canvas.findByRole('button');

    await userEvent.click(dropdownButton);

    await expect(handleEraseMockFunction).toHaveBeenCalledTimes(0);

    const eraseMenuItem = await canvas.findByText('Erase');

    await userEvent.click(eraseMenuItem);

    await expect(handleEraseMockFunction).toHaveBeenCalledTimes(1);
  },
};
