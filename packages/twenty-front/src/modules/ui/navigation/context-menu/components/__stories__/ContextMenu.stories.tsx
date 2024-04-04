import { Meta, StoryObj } from '@storybook/react';
import { useSetRecoilState } from 'recoil';

import { RecordTableScope } from '@/object-record/record-table/scopes/RecordTableScope';
import { ComponentDecorator } from '~/testing/decorators/ComponentDecorator';
import { MemoryRouterDecorator } from '~/testing/decorators/MemoryRouterDecorator';

import { contextMenuIsOpenState } from '../../states/contextMenuIsOpenState';
import { contextMenuPositionState } from '../../states/contextMenuPositionState';
import { ContextMenu } from '../ContextMenu';

const FilledContextMenu = () => {
  const setContextMenuPosition = useSetRecoilState(contextMenuPositionState);
  setContextMenuPosition({
    x: 100,
    y: 10,
  });
  const setContextMenuOpenState = useSetRecoilState(contextMenuIsOpenState);
  setContextMenuOpenState(true);
  return <ContextMenu />;
};

const meta: Meta<typeof ContextMenu> = {
  title: 'UI/Navigation/ContextMenu/ContextMenu',
  component: FilledContextMenu,
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
type Story = StoryObj<typeof ContextMenu>;

export const Default: Story = {};
