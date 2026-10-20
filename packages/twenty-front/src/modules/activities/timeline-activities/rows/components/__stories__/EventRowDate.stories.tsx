import { getMockedDateWithOffset } from '~/testing/utils/getMockedDateWithOffset';
import { EventRowDate } from '@/activities/timeline-activities/rows/components/EventRowDate';
import { type Meta, type StoryObj } from '@storybook/react-vite';

import { ComponentDecorator } from 'twenty-ui/testing';

const meta: Meta<typeof EventRowDate> = {
  title: 'Modules/TimelineActivities/Rows/EventRowDate',
  component: EventRowDate,
  decorators: [ComponentDecorator],
};

export default meta;
type Story = StoryObj<typeof EventRowDate>;

export const Default: Story = {
  args: {
    happensAt: getMockedDateWithOffset({ days: -3 }),
  },
};

export const WithoutDate: Story = {
  args: {
    happensAt: undefined,
  },
};
