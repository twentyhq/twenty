import {
  type Decorator,
  type Meta,
  type StoryObj,
} from '@storybook/react-vite';
import { expect, fn, userEvent, within } from 'storybook/test';

import { SettingsAccountsBlocklistTableRow } from '@/settings/accounts/components/SettingsAccountsBlocklistTableRow';
import { mockedBlocklist } from '@/settings/accounts/components/__stories__/mockedBlocklist';
import { ComponentDecorator } from 'twenty-ui/testing';
import { formatToHumanReadableDate } from '~/utils/date-utils';
import { assertIsDefinedOrThrow } from 'twenty-shared/utils';

const [mockedBlocklistItem] = mockedBlocklist;
assertIsDefinedOrThrow(mockedBlocklistItem);

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
    blocklistItem: mockedBlocklistItem,
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
      await canvas.findByText(mockedBlocklistItem.handle),
    ).toBeInTheDocument();
    expect(
      await canvas.findByText(
        formatToHumanReadableDate(mockedBlocklistItem.createdAt),
      ),
    ).toBeInTheDocument();
  },
};

export const DeleteFirstElementFromBlocklist: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    expect(onRemoveJestFn).toHaveBeenCalledTimes(0);

    const [removeFromBlocklistButton] = canvas.getAllByRole('button');
    assertIsDefinedOrThrow(removeFromBlocklistButton);

    await userEvent.click(removeFromBlocklistButton);

    expect(onRemoveJestFn).toHaveBeenCalledTimes(1);
    expect(onRemoveJestFn).toHaveBeenCalledWith('1');
  },
};
