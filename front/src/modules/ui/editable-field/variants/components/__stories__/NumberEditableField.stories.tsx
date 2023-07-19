import type { Meta, StoryObj } from '@storybook/react';
import { IconCurrencyDollar } from '@tabler/icons-react';

import { getRenderWrapperForComponent } from '~/testing/renderWrappers';

import { NumberEditableField } from '../NumberEditableField';

const meta: Meta<typeof NumberEditableField> = {
  title: 'UI/EditableField/NumberEditableField',
  component: NumberEditableField,
};

export default meta;
type Story = StoryObj<typeof NumberEditableField>;

export const Default: Story = {
  render: getRenderWrapperForComponent(
    <NumberEditableField
      value={10}
      icon={<IconCurrencyDollar />}
      placeholder="Number"
    />,
  ),
};
