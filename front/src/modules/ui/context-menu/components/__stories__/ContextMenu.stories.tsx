import { MemoryRouter } from 'react-router-dom';
import { Meta, StoryObj } from '@storybook/react';
import { useSetRecoilState } from 'recoil';

import { useCompanyTableContextMenuEntries } from '@/companies/hooks/useCompanyTableContextMenuEntries';
import { CompanyTableMockMode } from '@/companies/table/components/CompanyTableMockMode';
import { TableRecoilScopeContext } from '@/ui/table/states/recoil-scope-contexts/TableRecoilScopeContext';
import { RecoilScope } from '@/ui/utilities/recoil-scope/components/RecoilScope';
import { ComponentDecorator } from '~/testing/decorators/ComponentDecorator';

import { contextMenuIsOpenState } from '../../states/contextMenuIsOpenState';
import { contextMenuPositionState } from '../../states/contextMenuPositionState';
import { ContextMenu } from '../ContextMenu';

const FilledContextMenu = (props: { selectedIds: string[] }) => {
  const { setContextMenuEntries } = useCompanyTableContextMenuEntries();
  setContextMenuEntries();
  const setContextMenuPosition = useSetRecoilState(contextMenuPositionState);
  setContextMenuPosition({
    x: 100,
    y: 10,
  });
  const setContextMenuOpenState = useSetRecoilState(contextMenuIsOpenState);
  setContextMenuOpenState(true);
  return <ContextMenu selectedIds={props.selectedIds} />;
};

const meta: Meta<typeof ContextMenu> = {
  title: 'UI/ContextMenu/ContextMenu',
  component: FilledContextMenu,
  decorators: [
    (Story) => (
      <RecoilScope CustomRecoilScopeContext={TableRecoilScopeContext}>
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
type Story = StoryObj<typeof ContextMenu>;

export const Default: Story = {};
