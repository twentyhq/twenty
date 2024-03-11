import { Meta, StoryObj } from '@storybook/react';

import { Calendar } from '@/activities/calendar/components/Calendar';
import { ComponentDecorator } from '~/testing/decorators/ComponentDecorator';

const meta: Meta<typeof Calendar> = {
  title: 'Modules/Activities/Calendar/Calendar',
  component: Calendar,
  decorators: [ComponentDecorator],
  parameters: {
    container: { width: 728 },
  },
};

export default meta;
type Story = StoryObj<typeof Calendar>;

export const Default: Story = {};
