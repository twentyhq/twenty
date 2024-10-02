import { Meta, StoryObj } from '@storybook/react';
import { useSetRecoilState } from 'recoil';
import { ComponentDecorator } from 'twenty-ui';

import { RecordTableScope } from '@/object-record/record-table/scopes/RecordTableScope';
import { MemoryRouterDecorator } from '~/testing/decorators/MemoryRouterDecorator';

import { actionMenuDropdownIsOpenState } from '../../states/actionMenuDropdownIsOpenState';
import { actionMenuDropdownPositionState } from '../../states/actionMenuDropdownPositionState';
import { ActionMenuDropdown } from '../ActionMenuDropdown';

const FilledActionMenuDropdown = () => {
  const setActionMenuDropdownPosition = useSetRecoilState(
    actionMenuDropdownPositionState,
  );
  setActionMenuDropdownPosition({
    x: 100,
    y: 10,
  });
  const setActionMenuDropdownOpenState = useSetRecoilState(
    actionMenuDropdownIsOpenState,
  );
  setActionMenuDropdownOpenState(true);
  return <ActionMenuDropdown />;
};

const meta: Meta<typeof ActionMenuDropdown> = {
  title: 'UI/Navigation/ActionMenuDropdown/ActionMenuDropdown',
  component: FilledActionMenuDropdown,
  decorators: [
    MemoryRouterDecorator,
    (Story) => (
      <RecordTableScope
        recordTableScopeId="companies"
        onColumnsChange={() => {}}
      >
        <Story />
      </RecordTableScope>
    ),
    ComponentDecorator,
  ],
  args: { selectedIds: ['TestId'] },
};

export default meta;
type Story = StoryObj<typeof ActionMenuDropdown>;

export const Default: Story = {};
