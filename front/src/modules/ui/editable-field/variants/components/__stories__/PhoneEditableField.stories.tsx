import { BrowserRouter } from 'react-router-dom';
import type { Meta, StoryObj } from '@storybook/react';
import { IconPhone } from '@tabler/icons-react';

import { getRenderWrapperForComponent } from '~/testing/renderWrappers';

import { PhoneEditableField } from '../PhoneEditableField';

const meta: Meta<typeof PhoneEditableField> = {
  title: 'UI/EditableField/PhoneEditableField',
  component: PhoneEditableField,
};

export default meta;
type Story = StoryObj<typeof PhoneEditableField>;

export const Default: Story = {
  render: getRenderWrapperForComponent(
    <BrowserRouter>
      <PhoneEditableField
        value={'+33714446494'}
        icon={<IconPhone />}
        placeholder="Phone"
      />
    </BrowserRouter>,
  ),
};
