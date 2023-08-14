import { MemoryRouter } from 'react-router-dom';
import type { Meta, StoryObj } from '@storybook/react';
import { useSetRecoilState } from 'recoil';

import { useActionBarEntries } from '@/companies/hooks/useActionBarEntries';
import { CompanyTableMockMode } from '@/companies/table/components/CompanyTableMockMode';
import { TableRecoilScopeContext } from '@/ui/table/states/recoil-scope-contexts/TableRecoilScopeContext';
import { RecoilScope } from '@/ui/utilities/recoil-scope/components/RecoilScope';
import { ComponentDecorator } from '~/testing/decorators/ComponentDecorator';

import { actionBarOpenState } from '../../states/ActionBarIsOpenState';
import { ActionBar } from '../ActionBar';

function FilledActionBar(props: { selectedIds: string[] }) {
  const setActionBar = useActionBarEntries();
  setActionBar();
  const setActionBarOpenState = useSetRecoilState(actionBarOpenState);
  setActionBarOpenState(true);
  return <ActionBar selectedIds={props.selectedIds} />;
}

const meta: Meta<typeof ActionBar> = {
  title: 'UI/ActionBar/ActionBar',
  component: FilledActionBar,
  decorators: [
    (Story) => (
      <RecoilScope SpecificContext={TableRecoilScopeContext}>
        <CompanyTableMockMode></CompanyTableMockMode>
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
