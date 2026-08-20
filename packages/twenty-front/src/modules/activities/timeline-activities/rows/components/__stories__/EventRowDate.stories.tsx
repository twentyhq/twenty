import { EventRowDate } from '@/activities/timeline-activities/rows/components/EventRowDate';
import { type Meta, type StoryObj } from '@storybook/react-vite';

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
    createdAt: '2024-03-09T09:30:00.000Z',
  },
};

export const WithoutDate: Story = {
  args: {
    createdAt: undefined,
  },
};
