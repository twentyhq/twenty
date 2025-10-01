import { type Meta, type StoryObj } from '@storybook/react';
import { TabMoreButton } from '../TabMoreButton';

const meta: Meta<typeof TabMoreButton> = {
  title: 'UI/Layout/TabList/TabMoreButton',
  component: TabMoreButton,
  args: {
    overflowCount: 3,
    active: false,
  },
};

export default meta;
type Story = StoryObj<typeof TabMoreButton>;

export const Default: Story = {
  args: {
    overflowCount: 3,
    active: false,
  },
};

export const Active: Story = {
  args: {
    overflowCount: 5,
    active: true,
  },
};
