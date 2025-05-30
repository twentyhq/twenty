import { Meta, StoryObj } from '@storybook/react';
import { TabMoreButton } from '../TabMoreButton';

const meta: Meta<typeof TabMoreButton> = {
  title: 'UI/Layout/Tab/TabMoreButton',
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

export const SingleTab: Story = {
  args: {
    hiddenTabsCount: 1,
    active: false,
  },
};

export const ManyTabs: Story = {
  args: {
    hiddenTabsCount: 12,
    active: false,
  },
};
