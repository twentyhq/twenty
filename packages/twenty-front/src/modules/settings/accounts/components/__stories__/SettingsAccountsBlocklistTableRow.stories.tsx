import { Decorator, Meta, StoryObj } from '@storybook/react';
import { expect, fn, userEvent, within } from '@storybook/test';

import { mockedBlocklist } from '@/settings/accounts/components/__stories__/mockedBlocklist';
import { SettingsAccountsBlocklistTableRow } from '@/settings/accounts/components/SettingsAccountsBlocklistTableRow';
import { formatToHumanReadableDate } from '~/utils/date-utils';
import { ComponentDecorator } from 'twenty-ui/testing';

const onRemoveJestFn = fn();

const ClearMocksDecorator: Decorator = (Story, context) => {
  if (context.parameters.clearMocks === true) {
    onRemoveJestFn.mockClear();
  }
  return <Story />;
};

const meta: Meta<typeof SettingsAccountsBlocklistTableRow> = {
  title:
    'Modules/Settings/Accounts/Blocklist/SettingsAccountsBlocklistTableRow',
  component: SettingsAccountsBlocklistTableRow,
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
type Story = StoryObj<typeof SettingsAccountsBlocklistTableRow>;

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
