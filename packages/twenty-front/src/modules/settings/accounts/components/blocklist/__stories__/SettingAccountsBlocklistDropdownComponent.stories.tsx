import { Decorator, Meta, StoryObj } from '@storybook/react';
import { expect, fn, userEvent, within } from '@storybook/test';

import { SettingsAccountsBlocklistDropdownComponent } from '@/settings/accounts/components/blocklist/components/SettingAccountsBlocklistDropdownComponent';
import { BLOCKLIST_SCOPE_DROPDOWN_ITEMS } from '@/settings/accounts/constants/BlocklistScopeDropdownItems';

const handleMultiSelectChangeJestFn = fn();
const setDropdownSearchTextJestFn = fn();

const ClearMocksDecorator: Decorator = (Story, context) => {
  if (context.parameters.clearMocks === true) {
    handleMultiSelectChangeJestFn.mockClear();
    setDropdownSearchTextJestFn.mockClear();
  }
  return <Story />;
};

const meta: Meta<typeof SettingsAccountsBlocklistDropdownComponent> = {
  title:
    'Modules/Settings/Accounts/Blocklist/SettingsAccountsBlocklistDropdownComponent',
  component: SettingsAccountsBlocklistDropdownComponent,
  decorators: [ClearMocksDecorator],
  args: {
    handleMultiSelectChange: handleMultiSelectChangeJestFn,
    setDropdownSearchText: setDropdownSearchTextJestFn,
    dropdownSearchText: '',
    selectedBlocklistScopes: [],
  },
  argTypes: {
    handleMultiSelectChange: { control: false },
    setDropdownSearchText: { control: false },
  },
  parameters: {
    clearMocks: true,
  },
};

export default meta;

type Story = StoryObj<typeof SettingsAccountsBlocklistDropdownComponent>;

export const Default: Story = {};

export const SearchAndSelect: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    expect(handleMultiSelectChangeJestFn).toHaveBeenCalledTimes(0);
    expect(setDropdownSearchTextJestFn).toHaveBeenCalledTimes(0);

    const searchInput = canvas.getByPlaceholderText('Search');
    await userEvent.type(searchInput, 'domain');
    expect(setDropdownSearchTextJestFn).toHaveBeenCalledWith('domain');

    const firstItem = canvas.getByText(BLOCKLIST_SCOPE_DROPDOWN_ITEMS[0].label);
    await userEvent.click(firstItem);
    expect(handleMultiSelectChangeJestFn).toHaveBeenCalledWith(
      BLOCKLIST_SCOPE_DROPDOWN_ITEMS[0].id,
    );
  },
};

export const SelectMultipleItems: Story = {
  args: {
    selectedBlocklistScopes: [BLOCKLIST_SCOPE_DROPDOWN_ITEMS[0].id],
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    expect(handleMultiSelectChangeJestFn).toHaveBeenCalledTimes(0);

    const secondItem = canvas.getByText(
      BLOCKLIST_SCOPE_DROPDOWN_ITEMS[1].label,
    );
    await userEvent.click(secondItem);
    expect(handleMultiSelectChangeJestFn).toHaveBeenCalledWith(
      BLOCKLIST_SCOPE_DROPDOWN_ITEMS[1].id,
    );

    const thirdItem = canvas.getByText(BLOCKLIST_SCOPE_DROPDOWN_ITEMS[2].label);
    await userEvent.click(thirdItem);
    expect(handleMultiSelectChangeJestFn).toHaveBeenCalledWith(
      BLOCKLIST_SCOPE_DROPDOWN_ITEMS[2].id,
    );
  },
};
