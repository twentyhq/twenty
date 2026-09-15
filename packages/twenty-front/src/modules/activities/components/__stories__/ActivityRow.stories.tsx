import { ActivityRow } from '@/activities/components/ActivityRow';
import { type Meta, type StoryObj } from '@storybook/react-vite';
import { expect, within } from 'storybook/test';

const meta: Meta<typeof ActivityRow> = {
  title: 'Modules/Activities/ActivityRow',
  component: ActivityRow,
  args: {
    children: 'Activity',
  },
};

export default meta;
type Story = StoryObj<typeof ActivityRow>;

export const Interactive: Story = {
  play: async ({ canvasElement }) => {
    expect(await within(canvasElement).findByText('Activity')).toHaveAttribute(
      'data-hover-highlight',
      'true',
    );
  },
};

export const Disabled: Story = {
  args: {
    disabled: true,
  },
  play: async ({ canvasElement }) => {
    expect(
      await within(canvasElement).findByText('Activity'),
    ).not.toHaveAttribute('data-hover-highlight');
  },
};
