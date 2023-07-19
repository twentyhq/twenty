import type { Meta, StoryObj } from '@storybook/react';
import { IconCalendar } from '@tabler/icons-react';

import { getRenderWrapperForComponent } from '~/testing/renderWrappers';

import { DateEditableField } from '../DateEditableField';

const meta: Meta<typeof DateEditableField> = {
  title: 'UI/EditableField/DateEditableField',
  component: DateEditableField,
};

export default meta;
type Story = StoryObj<typeof DateEditableField>;

export const Default: Story = {
  render: getRenderWrapperForComponent(
    <DateEditableField
      value={new Date().toISOString()}
      icon={<IconCalendar />}
    />,
  ),
};
