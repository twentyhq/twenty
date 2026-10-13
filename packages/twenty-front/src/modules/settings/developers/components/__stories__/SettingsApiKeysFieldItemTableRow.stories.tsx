import { type Meta, type StoryObj } from '@storybook/react-vite';
import { fn } from 'storybook/test';

import { SettingsApiKeysFieldItemTableRow } from '@/settings/developers/components/SettingsApiKeysFieldItemTableRow';
import { ComponentDecorator } from 'twenty-ui/testing';

const meta: Meta<typeof SettingsApiKeysFieldItemTableRow> = {
  title: 'Modules/Settings/Developers/ApiKeys/SettingsApiKeysFieldItemTableRow',
  component: SettingsApiKeysFieldItemTableRow,
  decorators: [ComponentDecorator],
  args: {
    apiKey: {
      id: '3f4a42e8-b81f-4f8c-9c20-1602e6b34791',
      name: 'Zapier Api Key',
      expiresAt: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString(), // 3 days from now
      revokedAt: null,
      role: {
        id: '1',
        label: 'Admin',
        icon: 'admin',
      },
    },
    onClick: fn(),
  },
};

export default meta;
type Story = StoryObj<typeof SettingsApiKeysFieldItemTableRow>;

export const Default: Story = {};
