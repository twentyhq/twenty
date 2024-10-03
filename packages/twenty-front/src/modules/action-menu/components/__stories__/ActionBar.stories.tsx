import { Meta, StoryObj } from '@storybook/react';
import { useSetRecoilState } from 'recoil';
import { ComponentDecorator } from 'twenty-ui';

import { RecordTableScope } from '@/object-record/record-table/scopes/RecordTableScope';
import { MemoryRouterDecorator } from '~/testing/decorators/MemoryRouterDecorator';

import { actionBarOpenState } from '../../states/actionBarIsOpenState';
import { ActionBar } from '../ActionBar';

const FilledActionBar = () => {
  const setActionBarOpenState = useSetRecoilState(actionBarOpenState);
  setActionBarOpenState(true);
  return <ActionBar />;
};

const meta: Meta<typeof ActionBar> = {
  title: 'UI/Navigation/ActionBar/ActionBar',
  component: FilledActionBar,
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
type Story = StoryObj<typeof ActionBar>;

export const Default: Story = {};
