import { EventRowDate } from '@/activities/timeline-activities/rows/components/EventRowDate';
import { type Meta, type StoryObj } from '@storybook/react-vite';
import { expect, within } from 'storybook/test';

import { ComponentDecorator } from 'twenty-ui/testing';

// stories run with a mocked date of 2024-03-12T09:30:00.000Z
const meta: Meta<typeof EventRowDate> = {
  title: 'Modules/TimelineActivities/Rows/EventRowDate',
  component: EventRowDate,
  decorators: [ComponentDecorator],
};

export default meta;
type Story = StoryObj<typeof EventRowDate>;

export const Default: Story = {
  args: {
    happensAt: '2024-03-09T09:30:00.000Z',
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    await expect(canvas.getByText('3 days ago')).toBeVisible();
  },
};

export const WithoutDate: Story = {
  args: {
    happensAt: undefined,
  },
};
