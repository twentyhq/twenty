import { type Meta, type StoryObj } from '@storybook/react-vite';

import { SettingsSectionSkeletonLoader } from '@/settings/components/SettingsSectionSkeletonLoader';
import { ComponentDecorator } from 'twenty-ui/testing';

const meta: Meta<typeof SettingsSectionSkeletonLoader> = {
  title: 'Modules/Settings/SettingsSectionSkeletonLoader',
  component: SettingsSectionSkeletonLoader,
  decorators: [ComponentDecorator],
};

export default meta;
type Story = StoryObj<typeof SettingsSectionSkeletonLoader>;

export const Default: Story = {};

export const WithHeader: Story = {
  args: { hasHeader: true, rowCount: 5 },
};
