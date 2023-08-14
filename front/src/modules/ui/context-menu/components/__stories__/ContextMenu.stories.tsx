import type { Meta, StoryObj } from '@storybook/react';

import { ComponentDecorator } from '~/testing/decorators/ComponentDecorator';

import { ContextMenu } from '../ContextMenu';
import { useContextMenuEntries } from '@/companies/hooks/useContextMenuEntries';
import { useSetRecoilState } from 'recoil';
import { RecoilScope } from '@/ui/utilities/recoil-scope/components/RecoilScope';
import { TableContext } from '@/ui/table/states/TableContext';
import { CompanyTableMockMode } from '@/companies/table/components/CompanyTableMockMode';
import { MemoryRouter } from 'react-router-dom';
import { contextMenuOpenState } from '../../states/ContextMenuIsOpenState';
import { contextMenuPositionState } from '../../states/ContextMenuPositionState';

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
