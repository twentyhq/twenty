import { BrowserRouter } from 'react-router-dom';
import type { Meta, StoryObj } from '@storybook/react';
import { IconPhone } from '@tabler/icons-react';

import { ComponentDecorator } from '~/testing/decorators/ComponentDecorator';

import { PhoneEditableField } from '../PhoneEditableField';

const meta: Meta<typeof PhoneEditableField> = {
  title: 'UI/EditableField/PhoneEditableField',
  component: PhoneEditableField,
  decorators: [
    (Story) => (
      <BrowserRouter>
        <Story />
      </BrowserRouter>
    ),
    ComponentDecorator,
  ],
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
