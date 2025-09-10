import { type Decorator, type Meta, type StoryObj } from '@storybook/react';
import { expect, fn, userEvent, within } from '@storybook/test';

import { mockedBlocklist } from '@/settings/accounts/components/__stories__/mockedBlocklist';
import { SettingsAccountsBlocklistTable } from '@/settings/accounts/components/SettingsAccountsBlocklistTable';
import { ComponentDecorator } from 'twenty-ui/testing';
import { I18nFrontDecorator } from '~/testing/decorators/I18nFrontDecorator';
import { formatToHumanReadableDate } from '~/utils/date-utils';

const handleBlockedEmailRemoveJestFn = fn();

const ClearMocksDecorator: Decorator = (Story, context) => {
  if (context.parameters.clearMocks === true) {
    handleBlockedEmailRemoveJestFn.mockClear();
  }
  return <Story />;
};

const meta: Meta<typeof SettingsAccountsBlocklistTable> = {
  title: 'Modules/Settings/Accounts/Blocklist/SettingsAccountsBlocklistTable',
  component: SettingsAccountsBlocklistTable,
  decorators: [ComponentDecorator, ClearMocksDecorator, I18nFrontDecorator],
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
type Story = StoryObj<typeof SettingsAccountsBlocklistTable>;

export const Default: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    for (const blocklistItem of mockedBlocklist) {
      expect(await canvas.findByText(blocklistItem.handle)).toBeInTheDocument();
      expect(
        await canvas.findByText(
          formatToHumanReadableDate(blocklistItem.createdAt),
        ),
      ).toBeInTheDocument();
    }
  },
};

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
