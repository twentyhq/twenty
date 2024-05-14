import { Meta, StoryObj } from '@storybook/react';
import { ComponentDecorator } from 'twenty-ui';

import { SettingsApiKeysFieldItemTableRow } from '@/settings/developers/components/SettingsApiKeysFieldItemTableRow';

const meta: Meta<typeof SettingsApiKeysFieldItemTableRow> = {
  title: 'Modules/Settings/Developers/ApiKeys/SettingsApiKeysFieldItemTableRow',
  component: SettingsApiKeysFieldItemTableRow,
  decorators: [ComponentDecorator],
  args: {
    fieldItem: {
      id: '3f4a42e8-b81f-4f8c-9c20-1602e6b34791',
      name: 'Zapier Api Key',
      type: 'internal',
      expiration: 'In 3 days',
    },
  },
};

export default meta;
type Story = StoryObj<typeof SettingsApiKeysFieldItemTableRow>;

export const Default: Story = {};
