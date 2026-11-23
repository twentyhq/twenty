import { type Meta, type StoryObj } from '@storybook/react-vite';
import { ComponentDecorator } from 'twenty-ui/testing';

import { SystemNotificationSettingsIllustration } from '@/settings/experience/components/SystemNotificationSettingsIllustration';

const meta: Meta<typeof SystemNotificationSettingsIllustration> = {
  title: 'Modules/Settings/Experience/SystemNotificationSettingsIllustration',
  component: SystemNotificationSettingsIllustration,
  decorators: [ComponentDecorator],
};

export default meta;
type Story = StoryObj<typeof SystemNotificationSettingsIllustration>;

export const Mac: Story = {
  args: { operatingSystem: 'mac', settingsEntryName: 'Google Chrome' },
};

export const Windows: Story = {
  args: { operatingSystem: 'windows', settingsEntryName: 'Google Chrome' },
};
