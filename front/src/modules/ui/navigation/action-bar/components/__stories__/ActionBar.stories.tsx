import { MemoryRouter } from 'react-router-dom';
import { Meta, StoryObj } from '@storybook/react';
import { useSetRecoilState } from 'recoil';

import { RecordTableScope } from '@/object-record/record-table/scopes/RecordTableScope';
import { ComponentDecorator } from '~/testing/decorators/ComponentDecorator';

import { actionBarOpenState } from '../../states/actionBarIsOpenState';
import { ActionBar } from '../ActionBar';

const FilledActionBar = (props: { selectedIds: string[] }) => {
  const setActionBarOpenState = useSetRecoilState(actionBarOpenState);
  setActionBarOpenState(true);
  return <ActionBar selectedIds={props.selectedIds} />;
};

const meta: Meta<typeof ActionBar> = {
  title: 'UI/Navigation/ActionBar/ActionBar',
  component: FilledActionBar,
  decorators: [
    (Story) => (
      <RecordTableScope
        recordTableScopeId="companies"
        onColumnsChange={() => {}}
      >
        <MemoryRouter>
          <Story />
        </MemoryRouter>
      </RecordTableScope>
    ),
    ComponentDecorator,
  ],
  args: { selectedIds: ['TestId'] },
};

export default meta;
type Story = StoryObj<typeof ActionBar>;

export const Default: Story = {};
