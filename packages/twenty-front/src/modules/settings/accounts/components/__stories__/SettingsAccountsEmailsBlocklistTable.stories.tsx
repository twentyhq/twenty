import { Decorator, Meta, StoryObj } from '@storybook/react';
import { expect, fn, userEvent, within } from '@storybook/test';

import { mockedBlocklist } from '@/settings/accounts/components/__stories__/mockedBlocklist';
import { SettingsAccountsEmailsBlocklistTable } from '@/settings/accounts/components/SettingsAccountsEmailsBlocklistTable';
import { ComponentDecorator } from '~/testing/decorators/ComponentDecorator';

const handleBlockedEmailRemoveJestFn = fn();

const ClearMocksDecorator: Decorator = (Story, context) => {
  if (context.parameters.clearMocks) {
    handleBlockedEmailRemoveJestFn.mockClear();
  }
  return <Story />;
};

const meta: Meta<typeof SettingsAccountsEmailsBlocklistTable> = {
  title:
    'Modules/Settings/Accounts/Blocklist/SettingsAccountsEmailsBlocklistTable',
  component: SettingsAccountsEmailsBlocklistTable,
  decorators: [ComponentDecorator, ClearMocksDecorator],
  args: {
    blocklist: mockedBlocklist,
    handleBlockedEmailRemove: handleBlockedEmailRemoveJestFn,
  },
  argTypes: {
    blocklist: { control: false },
    handleBlockedEmailRemove: { control: false },
  },
  parameters: {
    clearMocks: true,
  },
};

export default meta;
type Story = StoryObj<typeof SettingsAccountsEmailsBlocklistTable>;

export const Default: Story = {};

export const DeleteFirstElementFromBlocklist: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    expect(handleBlockedEmailRemoveJestFn).toHaveBeenCalledTimes(0);

    const removeFromBlocklistButton = canvas.getAllByRole('button')[0];

    await userEvent.click(removeFromBlocklistButton);

    expect(handleBlockedEmailRemoveJestFn).toHaveBeenCalledTimes(1);
    expect(handleBlockedEmailRemoveJestFn).toHaveBeenCalledWith('1');
  },
};
