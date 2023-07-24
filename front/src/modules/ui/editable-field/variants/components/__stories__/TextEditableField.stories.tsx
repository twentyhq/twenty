import type { Meta, StoryObj } from '@storybook/react';
import { IconUser } from '@tabler/icons-react';

import { ComponentDecorator } from '~/testing/decorators/ComponentDecorator';

import { TextEditableField } from '../TextEditableField';

const meta: Meta<typeof TextEditableField> = {
  title: 'UI/EditableField/TextEditableField',
  component: TextEditableField,
  decorators: [ComponentDecorator],
  argTypes: {
    icon: {
      type: 'boolean',
      mapping: {
        true: <IconUser />,
        false: undefined,
      },
    },
  },
  args: {
    value: 'John Doe',
    icon: true,
    placeholder: 'Name',
  },
};

export default meta;
type Story = StoryObj<typeof TextEditableField>;

export const Default: Story = {};
