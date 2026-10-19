import { getMockedDateWithOffset } from '~/testing/utils/getMockedDateWithOffset';
import { EventRowDate } from '@/activities/timeline-activities/rows/components/EventRowDate';
import { type Meta, type StoryObj } from '@storybook/react-vite';
import { expect, within } from 'storybook/test';

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
