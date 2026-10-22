import { type Meta, type StoryObj } from '@storybook/react-vite';

import { SettingsApplicationCustomSettingsSkeletonLoader } from '@/settings/applications/components/SettingsApplicationCustomSettingsSkeletonLoader';
import { ComponentDecorator } from 'twenty-ui/testing';

const meta: Meta<typeof SettingsApplicationCustomSettingsSkeletonLoader> = {
  title:
    'Modules/Settings/Applications/SettingsApplicationCustomSettingsSkeletonLoader',
  component: SettingsApplicationCustomSettingsSkeletonLoader,
  decorators: [ComponentDecorator],
};

export default meta;
type Story = StoryObj<typeof SettingsApplicationCustomSettingsSkeletonLoader>;

export const Default: Story = {};
