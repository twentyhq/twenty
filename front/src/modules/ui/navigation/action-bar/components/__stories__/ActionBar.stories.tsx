import { MemoryRouter } from 'react-router-dom';
import { Meta, StoryObj } from '@storybook/react';
import { useSetRecoilState } from 'recoil';

import { useCompanyTableContextMenuEntries } from '@/companies/hooks/useCompanyTableContextMenuEntries';
import { CompanyTableMockMode } from '@/companies/table/components/CompanyTableMockMode';
import { RecordTableScope } from '@/ui/object/record-table/scopes/RecordTableScope';
import { ComponentDecorator } from '~/testing/decorators/ComponentDecorator';

import { actionBarOpenState } from '../../states/actionBarIsOpenState';
import { ActionBar } from '../ActionBar';

const FilledActionBar = (props: { selectedIds: string[] }) => {
  const { setActionBarEntries } = useCompanyTableContextMenuEntries();
  setActionBarEntries();
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
        onEntityCountChange={() => {}}
      >
        <MemoryRouter>
          <CompanyTableMockMode />
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
