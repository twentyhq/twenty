import { Decorator, Meta, StoryObj } from '@storybook/react';
import { expect, fn, userEvent, within } from '@storybook/test';

import { mockedBlocklist } from '@/settings/accounts/components/__stories__/mockedBlocklist';
import { SettingsAccountsEmailsBlocklistTableRow } from '@/settings/accounts/components/SettingsAccountsEmailsBlocklistTableRow';
import { ComponentDecorator } from '~/testing/decorators/ComponentDecorator';
import { formatToHumanReadableDate } from '~/utils';

const onRemoveJestFn = fn();

const ClearMocksDecorator: Decorator = (Story, context) => {
  if (context.parameters.clearMocks === true) {
    onRemoveJestFn.mockClear();
  }
  return <Story />;
};

const meta: Meta<typeof SettingsAccountsEmailsBlocklistTableRow> = {
  title:
    'Modules/Settings/Accounts/Blocklist/SettingsAccountsEmailsBlocklistTableRow',
  component: SettingsAccountsEmailsBlocklistTableRow,
  decorators: [ComponentDecorator, ClearMocksDecorator],
  args: {
    blocklistItem: mockedBlocklist[0],
    onRemove: onRemoveJestFn,
  },
  argTypes: {
    blocklistItem: { control: false },
    onRemove: { control: false },
  },
  parameters: {
    clearMocks: true,
  },
};

export default meta;
type Story = StoryObj<typeof SettingsAccountsEmailsBlocklistTableRow>;

export const Default: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    expect(
      await canvas.findByText(mockedBlocklist[0].handle),
    ).toBeInTheDocument();
    expect(
      await canvas.findByText(
        formatToHumanReadableDate(mockedBlocklist[0].createdAt),
      ),
    ).toBeInTheDocument();
  },
};

export const DeleteFirstElementFromBlocklist: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    expect(onRemoveJestFn).toHaveBeenCalledTimes(0);

    const removeFromBlocklistButton = canvas.getAllByRole('button')[0];

    await userEvent.click(removeFromBlocklistButton);

    expect(onRemoveJestFn).toHaveBeenCalledTimes(1);
    expect(onRemoveJestFn).toHaveBeenCalledWith('1');
  },
};
