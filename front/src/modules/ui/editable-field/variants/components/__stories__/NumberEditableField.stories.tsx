import type { Meta, StoryObj } from '@storybook/react';
import { IconCurrencyDollar } from '@tabler/icons-react';

import { ComponentDecorator } from '~/testing/decorators';

import { NumberEditableField } from '../NumberEditableField';

const meta: Meta<typeof NumberEditableField> = {
  title: 'UI/EditableField/NumberEditableField',
  component: NumberEditableField,
  decorators: [ComponentDecorator],
  argTypes: {
    icon: {
      type: 'boolean',
      mapping: {
        true: <IconCurrencyDollar />,
        false: undefined,
      },
    },
    value: { control: { type: 'number' } },
  },
  args: {
    value: 10,
    icon: true,
    placeholder: 'Number',
  },
};

export default meta;
type Story = StoryObj<typeof NumberEditableField>;

export const Default: Story = {};
