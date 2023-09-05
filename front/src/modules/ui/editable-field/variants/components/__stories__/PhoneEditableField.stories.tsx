import type { Meta, StoryObj } from '@storybook/react';

import { IconPhone } from '@/ui/icon';
import { ComponentWithRouterDecorator } from '~/testing/decorators/ComponentWithRouterDecorator';

import { PhoneEditableField } from '../PhoneEditableField';

const meta: Meta<typeof PhoneEditableField> = {
  title: 'UI/EditableField/PhoneEditableField',
  component: PhoneEditableField,
  decorators: [ComponentWithRouterDecorator],
  argTypes: {
    Icon: {
      type: 'boolean',
      mapping: {
        true: IconPhone,
        false: undefined,
      },
    },
  },
  args: {
    value: '+33714446494',
    Icon: IconPhone,
    placeholder: 'Phone',
  },
};

export default meta;
type Story = StoryObj<typeof PhoneEditableField>;

export const Default: Story = {};
