import { MemoryRouter } from 'react-router-dom';
import type { Meta, StoryObj } from '@storybook/react';
import { useSetRecoilState } from 'recoil';

import { useContextMenuEntries } from '@/companies/hooks/useContextMenuEntries';
import { CompanyTableMockMode } from '@/companies/table/components/CompanyTableMockMode';
import { TableContext } from '@/ui/table/states/TableContext';
import { RecoilScope } from '@/ui/utilities/recoil-scope/components/RecoilScope';
import { ComponentDecorator } from '~/testing/decorators/ComponentDecorator';

import { contextMenuOpenState } from '../../states/ContextMenuIsOpenState';
import { contextMenuPositionState } from '../../states/ContextMenuPositionState';
import { ContextMenu } from '../ContextMenu';

function FilledContextMenu(props: { selectedIds: string[] }) {
  const setContextMenu = useContextMenuEntries();
  setContextMenu();
  const setContextMenuPosition = useSetRecoilState(contextMenuPositionState);
  setContextMenuPosition({
    x: 100,
    y: 10,
  });
  const setContextMenuOpenState = useSetRecoilState(contextMenuOpenState);
  setContextMenuOpenState(true);
  return <ContextMenu selectedIds={props.selectedIds} />;
}

const meta: Meta<typeof ContextMenu> = {
  title: 'UI/ContextMenu/ContextMenu',
  component: FilledContextMenu,
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
type Story = StoryObj<typeof ContextMenu>;

export const Default: Story = {};
