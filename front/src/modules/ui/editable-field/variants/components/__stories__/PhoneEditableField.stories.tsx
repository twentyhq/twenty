import type { Meta, StoryObj } from '@storybook/react';
import { IconPhone } from '@tabler/icons-react';

import { ComponentWithRouterDecorator } from '~/testing/decorators/ComponentWithRouterDecorator';

import { PhoneEditableField } from '../PhoneEditableField';

const meta: Meta<typeof PhoneEditableField> = {
  title: 'UI/EditableField/PhoneEditableField',
  component: PhoneEditableField,
  decorators: [ComponentWithRouterDecorator],
  argTypes: {
    icon: {
      type: 'boolean',
      mapping: {
        true: <IconPhone />,
        false: undefined,
      },
    },
  },
  args: {
    value: '+33714446494',
    icon: true,
    placeholder: 'Phone',
  },
};

export default meta;
type Story = StoryObj<typeof PhoneEditableField>;

export const Default: Story = {};
