import { ActivityList } from '@/activities/components/ActivityList';
import { type Meta, type StoryObj } from '@storybook/react-vite';
import { expect } from 'storybook/test';

const meta: Meta<typeof ActivityList> = {
  title: 'Modules/Activities/ActivityList',
  component: ActivityList,
  args: {
    children: <div>First activity</div>,
  },
};

export default meta;
type Story = StoryObj<typeof ActivityList>;

export const Scrollable: Story = {
  args: {
    isScrollable: true,
  },
  play: async ({ canvasElement }) => {
    expect(
      canvasElement.querySelector('[data-scrollable="true"]'),
    ).not.toBeNull();
  },
};
