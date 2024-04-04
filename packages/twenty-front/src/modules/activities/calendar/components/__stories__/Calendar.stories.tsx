import { Meta, StoryObj } from '@storybook/react';

import { Calendar } from '@/activities/calendar/components/Calendar';
import { ComponentDecorator } from '~/testing/decorators/ComponentDecorator';
import { SnackBarDecorator } from '~/testing/decorators/SnackBarDecorator';
import { graphqlMocks } from '~/testing/graphqlMocks';

const meta: Meta<typeof Calendar> = {
  title: 'Modules/Activities/Calendar/Calendar',
  component: Calendar,
  decorators: [ComponentDecorator, SnackBarDecorator],
  parameters: {
    container: { width: 728 },
    msw: graphqlMocks,
  },
  args: {
    targetableObject: {
      id: '1',
      targetObjectNameSingular: 'Person',
    },
  },
};

export default meta;
type Story = StoryObj<typeof Calendar>;

export const Default: Story = {};
