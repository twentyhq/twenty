import { Meta, StoryObj } from '@storybook/react';

import { RecordTableEmptyState } from '@/object-record/record-table/components/RecordTableEmptyState';
import { RecordTableScope } from '@/object-record/record-table/scopes/RecordTableScope';
import { SnackBarProviderScope } from '@/ui/feedback/snack-bar-manager/scopes/SnackBarProviderScope';
import { MemoryRouterDecorator } from '~/testing/decorators/MemoryRouterDecorator';

const meta: Meta = {
  title: 'Modules/ObjectRecord/RecordTable/RecordTableEmptyState',
  component: RecordTableEmptyState,
  decorators: [
    MemoryRouterDecorator,
    (Story) => (
      <SnackBarProviderScope snackBarManagerScopeId="snack-bar-manager">
        <RecordTableScope
          recordTableScopeId="persons"
          onColumnsChange={() => {}}
        >
          <Story />
        </RecordTableScope>
      </SnackBarProviderScope>
    ),
  ],
};

export default meta;
type Story = StoryObj<typeof RecordTableEmptyState>;

export const Default: Story = {
  args: {
    objectNameSingular: 'person',
    objectLabel: 'person',
    isRemote: false,
    createRecord: () => {},
  },
};

export const Remote: Story = {
  args: {
    objectNameSingular: 'person',
    objectLabel: 'remote person',
    isRemote: true,
    createRecord: () => {},
  },
};
