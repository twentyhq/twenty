import { Meta, StoryObj } from '@storybook/react';

import { RecordTableEmptyState } from '@/object-record/record-table/components/RecordTableEmptyState';
import { MemoryRouterDecorator } from '~/testing/decorators/MemoryRouterDecorator';

const meta: Meta = {
  title: 'Modules/ObjectRecord/RecordTable/RecordTableEmptyState',
  component: RecordTableEmptyState,
  decorators: [MemoryRouterDecorator],
};

export default meta;
type Story = StoryObj<typeof RecordTableEmptyState>;

export const Default: Story = {
  args: {
    objectLabel: 'person',
    isRemote: false,
    createRecord: () => {},
  },
};

export const Remote: Story = {
  args: {
    objectLabel: 'remote person',
    isRemote: true,
    createRecord: () => {},
  },
};
