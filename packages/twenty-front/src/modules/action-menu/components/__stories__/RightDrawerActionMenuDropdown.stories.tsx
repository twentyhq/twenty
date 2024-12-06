import { expect, jest } from '@storybook/jest';
import { Meta, StoryObj } from '@storybook/react';
import { RecoilRoot } from 'recoil';

import { RightDrawerActionMenuDropdown } from '@/action-menu/components/RightDrawerActionMenuDropdown';
import { actionMenuEntriesComponentState } from '@/action-menu/states/actionMenuEntriesComponentState';
import { ActionMenuComponentInstanceContext } from '@/action-menu/states/contexts/ActionMenuComponentInstanceContext';
import {
  ActionMenuEntry,
  ActionMenuEntryScope,
  ActionMenuEntryType,
} from '@/action-menu/types/ActionMenuEntry';
import { contextStoreNumberOfSelectedRecordsComponentState } from '@/context-store/states/contextStoreNumberOfSelectedRecordsComponentState';
import { contextStoreTargetedRecordsRuleComponentState } from '@/context-store/states/contextStoreTargetedRecordsRuleComponentState';
import { userEvent, waitFor, within } from '@storybook/test';
import {
  ComponentDecorator,
  getCanvasElementForDropdownTesting,
  IconFileExport,
  IconHeart,
  IconTrash,
  MenuItemAccent,
} from 'twenty-ui';

const deleteMock = jest.fn();
const addToFavoritesMock = jest.fn();
const exportMock = jest.fn();

const meta: Meta<typeof RightDrawerActionMenuDropdown> = {
  title: 'Modules/ActionMenu/RightDrawerActionMenuDropdown',
  component: RightDrawerActionMenuDropdown,
  decorators: [
    (Story) => (
      <RecoilRoot
        initializeState={({ set }) => {
          set(
            contextStoreTargetedRecordsRuleComponentState.atomFamily({
              instanceId: 'story-action-menu',
            }),
            {
              mode: 'selection',
              selectedRecordIds: ['1'],
            },
          );
          set(
            contextStoreNumberOfSelectedRecordsComponentState.atomFamily({
              instanceId: 'story-action-menu',
            }),
            1,
          );

          const map = new Map<string, ActionMenuEntry>();

          set(
            actionMenuEntriesComponentState.atomFamily({
              instanceId: 'story-action-menu',
            }),
            map,
          );

          map.set('addToFavorites', {
            type: ActionMenuEntryType.Standard,
            scope: ActionMenuEntryScope.RecordSelection,
            key: 'addToFavorites',
            label: 'Add to favorites',
            position: 0,
            Icon: IconHeart,
            onClick: addToFavoritesMock,
          });

          map.set('export', {
            type: ActionMenuEntryType.Standard,
            scope: ActionMenuEntryScope.RecordSelection,
            key: 'export',
            label: 'Export',
            position: 1,
            Icon: IconFileExport,
            onClick: exportMock,
          });

          map.set('delete', {
            type: ActionMenuEntryType.Standard,
            scope: ActionMenuEntryScope.RecordSelection,
            key: 'delete',
            label: 'Delete',
            position: 2,
            Icon: IconTrash,
            onClick: deleteMock,
            accent: 'danger' as MenuItemAccent,
          });
        }}
      >
        <ActionMenuComponentInstanceContext.Provider
          value={{ instanceId: 'story-action-menu' }}
        >
          <Story />
        </ActionMenuComponentInstanceContext.Provider>
      </RecoilRoot>
    ),
    ComponentDecorator,
  ],
  args: {
    actionMenuId: 'story-action-menu',
  },
};

export default meta;

type Story = StoryObj<typeof RightDrawerActionMenuDropdown>;

export const Default: Story = {
  args: {
    actionMenuId: 'story-action-menu',
  },
};

export const WithButtonClicks: Story = {
  args: {
    actionMenuId: 'story-action-menu',
  },
  play: async () => {
    const canvas = within(getCanvasElementForDropdownTesting());

    let actionButton = await canvas.findByText('Actions');
    await userEvent.click(actionButton);

    const deleteButton = await canvas.findByText('Delete');
    await userEvent.click(deleteButton);

    actionButton = await canvas.findByText('Actions');
    await userEvent.click(actionButton);

    const addToFavoritesButton = await canvas.findByText('Add to favorites');
    await userEvent.click(addToFavoritesButton);

    actionButton = await canvas.findByText('Actions');
    await userEvent.click(actionButton);

    const exportButton = await canvas.findByText('Export');
    await userEvent.click(exportButton);

    await waitFor(() => {
      expect(deleteMock).toHaveBeenCalled();
      expect(addToFavoritesMock).toHaveBeenCalled();
      expect(exportMock).toHaveBeenCalled();
    });
  },
};
