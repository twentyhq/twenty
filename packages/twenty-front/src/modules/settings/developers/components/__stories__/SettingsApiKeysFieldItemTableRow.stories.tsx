import { type Meta, type StoryObj } from '@storybook/react';

import { SettingsApiKeysFieldItemTableRow } from '@/settings/developers/components/SettingsApiKeysFieldItemTableRow';
import { ComponentDecorator, RouterDecorator } from 'twenty-ui/testing';
import { I18nFrontDecorator } from '~/testing/decorators/I18nFrontDecorator';

const meta: Meta<typeof SettingsApiKeysFieldItemTableRow> = {
  title: 'Modules/Settings/Developers/ApiKeys/SettingsApiKeysFieldItemTableRow',
  component: SettingsApiKeysFieldItemTableRow,
  decorators: [ComponentDecorator, RouterDecorator, I18nFrontDecorator],
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
    to: '/settings/developers/api-keys/3f4a42e8-b81f-4f8c-9c20-1602e6b34791',
  },
};

export default meta;
type Story = StoryObj<typeof SettingsApiKeysFieldItemTableRow>;

export const Default: Story = {};
