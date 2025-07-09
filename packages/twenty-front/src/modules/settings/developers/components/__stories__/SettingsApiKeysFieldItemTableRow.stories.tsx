import { Meta, StoryObj } from '@storybook/react';

import { SettingsApiKeysFieldItemTableRow } from '@/settings/developers/components/SettingsApiKeysFieldItemTableRow';
import { ComponentDecorator, RouterDecorator } from 'twenty-ui/testing';

const meta: Meta<typeof SettingsApiKeysFieldItemTableRow> = {
  title: 'Modules/Settings/Developers/ApiKeys/SettingsApiKeysFieldItemTableRow',
  component: SettingsApiKeysFieldItemTableRow,
  decorators: [ComponentDecorator, RouterDecorator],
  args: {
    apiKey: {
      id: '3f4a42e8-b81f-4f8c-9c20-1602e6b34791',
      name: 'Zapier Api Key',
      expiresAt: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString(), // 3 days from now
      revokedAt: null,
    },
    to: '/settings/developers/api-keys/3f4a42e8-b81f-4f8c-9c20-1602e6b34791',
  },
};

export default meta;
type Story = StoryObj<typeof SettingsApiKeysFieldItemTableRow>;

export const Default: Story = {};
