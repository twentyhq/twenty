import { useFindManyRecords } from '@/object-record/hooks/useFindManyRecords';
import { mockedBlocklist } from '@/settings/accounts/components/blocklist/__stories__/mockedBlocklist';
import { SettingsAccountsBlocklistSection } from '@/settings/accounts/components/blocklist/components/SettingsAccountsBlocklistSection';
import { Decorator, Meta, StoryObj } from '@storybook/react';
import { expect, within } from '@storybook/test';
import { ComponentDecorator } from 'twenty-ui';

jest.mock('@/object-record/hooks/useFindManyRecords', () => ({
  useFindManyRecords: jest.fn(),
}));

const mockUseFindManyRecords = useFindManyRecords as jest.Mock;

const ClearMocksDecorator: Decorator = (Story, context) => {
  if (Boolean(context.parameters.clearMocks) === true) {
    mockUseFindManyRecords.mockClear();
  }
  return <Story />;
};

const meta: Meta<typeof SettingsAccountsBlocklistSection> = {
  title: 'Modules/Settings/Accounts/Blocklist/SettingsAccountsBlocklistSection',
  component: SettingsAccountsBlocklistSection,
  decorators: [ComponentDecorator, ClearMocksDecorator],
  parameters: {
    clearMocks: true,
  },
};

export default meta;
type Story = StoryObj<typeof SettingsAccountsBlocklistSection>;

export const Default: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    const title = canvas.getByText('Blocklist');
    expect(title).toBeInTheDocument();

    const description = canvas.getByText(
      'Exclude the following people and domains from my email sync',
    );
    expect(description).toBeInTheDocument();
  },
};

export const WithBlocklistItems: Story = {
  parameters: {
    clearMocks: false,
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    mockUseFindManyRecords.mockReturnValue({ records: mockedBlocklist });

    mockedBlocklist.forEach((item) => {
      const blocklistItem = canvas.getByText(item.handle);
      expect(blocklistItem).toBeInTheDocument();
    });
  },
};

export const EmptyBlocklist: Story = {
  parameters: {
    clearMocks: false,
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    mockUseFindManyRecords.mockReturnValue({ records: [] });

    mockedBlocklist.forEach((item) => {
      const blocklistItem = canvas.queryByText(item.handle);
      expect(blocklistItem).not.toBeInTheDocument();
    });
  },
};
