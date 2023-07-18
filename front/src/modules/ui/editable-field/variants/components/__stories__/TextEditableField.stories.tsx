import type { Meta, StoryObj } from '@storybook/react';
import { IconUser } from '@tabler/icons-react';

import { getRenderWrapperForComponent } from '~/testing/renderWrappers';

import { TextEditableField } from '../TextEditableField';

const meta: Meta<typeof TextEditableField> = {
  title: 'UI/EditableField/TextEditableField',
  component: TextEditableField,
};

export default meta;
type Story = StoryObj<typeof TextEditableField>;

export const Default: Story = {
  render: getRenderWrapperForComponent(
    <TextEditableField
      value={'John Doe'}
      icon={<IconUser />}
      placeholder="Name"
    />,
  ),
};
