import { type Meta, type StoryObj } from '@storybook/react';
import { TabMoreButton } from '@/ui/layout/tab-list/components/TabMoreButton';

const meta: Meta<typeof TabMoreButton> = {
  title: 'UI/Layout/TabList/TabMoreButton',
  component: TabMoreButton,
  args: {
    hiddenTabsCount: 3,
    active: false,
  },
};

export default meta;
type Story = StoryObj<typeof TabMoreButton>;

export const Default: Story = {
  args: {
    hiddenTabsCount: 3,
    active: false,
  },
};

export const Active: Story = {
  args: {
    hiddenTabsCount: 5,
    active: true,
  },
};
