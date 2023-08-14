import type { Meta, StoryObj } from '@storybook/react';

import { ComponentDecorator } from '~/testing/decorators/ComponentDecorator';

import { ActionBar } from '../ActionBar';
import { RecoilScope } from '@/ui/utilities/recoil-scope/components/RecoilScope';
import { MemoryRouter } from 'react-router-dom';
import { CompanyTableMockMode } from '@/companies/table/components/CompanyTableMockMode';
import { EntityTableContextMenu } from '@/ui/table/context-menu/components/EntityTableContextMenu';
import { EntityTableActionBar } from '@/ui/table/action-bar/components/EntityTableActionBar';
import { TableContext } from '@/ui/table/states/TableContext';
import { useActionBarEntries } from '@/companies/hooks/useActionBarEntries';
import { useSetRecoilState } from 'recoil';
import { actionBarOpenState } from '../../states/ActionBarIsOpenState';

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
      <RecoilScope SpecificContext={TableContext}>
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
