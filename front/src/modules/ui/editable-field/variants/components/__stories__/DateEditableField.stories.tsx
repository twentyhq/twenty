import type { Meta, StoryObj } from '@storybook/react';

import { IconCalendar } from '@/ui/icon';
import { ComponentDecorator } from '~/testing/decorators/ComponentDecorator';

import { DateEditableField } from '../DateEditableField';

const meta: Meta<typeof DateEditableField> = {
  title: 'UI/EditableField/DateEditableField',
  component: DateEditableField,
  decorators: [ComponentDecorator],
  argTypes: {
    icon: {
      type: 'boolean',
      mapping: {
        true: <IconCalendar />,
        false: undefined,
      },
    },
    value: { control: { type: 'date' } },
  },
  args: {
    value: new Date().toISOString(),
    icon: true,
  },
};

export default meta;
type Story = StoryObj<typeof DateEditableField>;

export const Default: Story = {};
