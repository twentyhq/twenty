import { SettingsCard } from '@/settings/components/SettingsCard';
import { Meta, StoryObj } from '@storybook/react';
import { IllustrationIconCalendarEvent } from 'twenty-ui';
const meta: Meta<typeof SettingsCard> = {
  title: 'Modules/Settings/SettingsCard',
  component: SettingsCard,
};
export default meta;
type Story = StoryObj<typeof SettingsCard>;

export const Default: Story = {
  argTypes: {
    onClick: { control: false },
    title: { control: 'text', description: 'TitleCard' },
    Icon: IllustrationIconCalendarEvent,
  },
  args: {
    onClick: () => {},
    disabled: false,
  },
};
