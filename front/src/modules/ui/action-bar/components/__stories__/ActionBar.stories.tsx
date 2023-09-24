import { MemoryRouter } from 'react-router-dom';
import { type Meta, type StoryObj } from '@storybook/react';
import { useSetRecoilState } from 'recoil';

import { useCompanyTableActionBarEntries } from '@/companies/hooks/useCompanyTableActionBarEntries';
import { CompanyTableMockMode } from '@/companies/table/components/CompanyTableMockMode';
import { TableRecoilScopeContext } from '@/ui/table/states/recoil-scope-contexts/TableRecoilScopeContext';
import { RecoilScope } from '@/ui/utilities/recoil-scope/components/RecoilScope';
import { ComponentDecorator } from '~/testing/decorators/ComponentDecorator';

import { actionBarOpenState } from '../../states/actionBarIsOpenState';
import { ActionBar } from '../ActionBar';

const FilledActionBar = (props: { selectedIds: string[] }) => {
  const { setActionBarEntries } = useCompanyTableActionBarEntries();
  setActionBarEntries();
  const setActionBarOpenState = useSetRecoilState(actionBarOpenState);
  setActionBarOpenState(true);
  return <ActionBar selectedIds={props.selectedIds} />;
};

const meta: Meta<typeof ActionBar> = {
  title: 'UI/ActionBar/ActionBar',
  component: FilledActionBar,
  decorators: [
    (Story) => (
      <RecoilScope CustomRecoilScopeContext={TableRecoilScopeContext}>
        <CompanyTableMockMode />
        <MemoryRouter>
          <Story />
        </MemoryRouter>
      </RecoilScope>
    ),
    ComponentDecorator,
  ],
  args: { selectedIds: ['TestId'] },
};

export default meta;
type Story = StoryObj<typeof ActionBar>;

export const Default: Story = {};
