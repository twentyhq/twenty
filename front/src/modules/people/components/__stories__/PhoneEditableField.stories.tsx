import { BrowserRouter } from 'react-router-dom';
import type { Meta, StoryObj } from '@storybook/react';

import { PhoneCellEdit } from '@/ui/table/editable-cell/type/components/PhoneCellEdit';
import { ComponentDecorator } from '~/testing/decorators/ComponentDecorator';

const meta: Meta<typeof PhoneCellEdit> = {
  title: 'Modules/People/EditableFields/PhoneEditableField',
  component: PhoneCellEdit,
  decorators: [
    (Story) => (
      <BrowserRouter>
        <Story />
      </BrowserRouter>
    ),
    ComponentDecorator,
  ],
  args: {
    value: '+33714446494',
    autoFocus: true,
  },
};

export default meta;
type Story = StoryObj<typeof PhoneCellEdit>;

export const Default: Story = {};
