import { expect, jest } from '@storybook/jest';
import { Meta, StoryObj } from '@storybook/react';
import { RecoilRoot } from 'recoil';

import { RecordShowActionMenuBar } from '@/action-menu/components/RecordShowActionMenuBar';
import { actionMenuEntriesComponentState } from '@/action-menu/states/actionMenuEntriesComponentState';
import { ActionMenuComponentInstanceContext } from '@/action-menu/states/contexts/ActionMenuComponentInstanceContext';
import { contextStoreNumberOfSelectedRecordsComponentState } from '@/context-store/states/contextStoreNumberOfSelectedRecordsComponentState';
import { contextStoreTargetedRecordsRuleComponentState } from '@/context-store/states/contextStoreTargetedRecordsRuleComponentState';
import { MenuItemAccent } from '@/ui/navigation/menu-item/types/MenuItemAccent';
import { userEvent, waitFor, within } from '@storybook/test';
import {
  ComponentDecorator,
  IconFileExport,
  IconHeart,
  IconTrash,
} from 'twenty-ui';

const deleteMock = jest.fn();
const addToFavoritesMock = jest.fn();
const exportMock = jest.fn();

const meta: Meta<typeof RecordShowActionMenuBar> = {
  title: 'Modules/ActionMenu/RecordShowActionMenuBar',
  component: RecordShowActionMenuBar,
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
          set(
            actionMenuEntriesComponentState.atomFamily({
              instanceId: 'story-action-menu',
            }),
            new Map([
              [
                'addToFavorites',
                {
                  key: 'addToFavorites',
                  label: 'Add to favorites',
                  position: 0,
                  Icon: IconHeart,
                  onClick: addToFavoritesMock,
                },
              ],
              [
                'export',
                {
                  key: 'export',
                  label: 'Export',
                  position: 1,
                  Icon: IconFileExport,
                  onClick: exportMock,
                },
              ],
              [
                'delete',
                {
                  key: 'delete',
                  label: 'Delete',
                  position: 2,
                  Icon: IconTrash,
                  onClick: deleteMock,
                  accent: 'danger' as MenuItemAccent,
                },
              ],
            ]),
          );
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

type Story = StoryObj<typeof RecordShowActionMenuBar>;

export const Default: Story = {
  args: {
    actionMenuId: 'story-action-menu',
  },
};

export const WithButtonClicks: Story = {
  args: {
    actionMenuId: 'story-action-menu',
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    const deleteButton = await canvas.findByText('Delete');
    await userEvent.click(deleteButton);

    const addToFavoritesButton = await canvas.findByText('Add to favorites');
    await userEvent.click(addToFavoritesButton);

    const exportButton = await canvas.findByText('Export');
    await userEvent.click(exportButton);

    await waitFor(() => {
      expect(deleteMock).toHaveBeenCalled();
      expect(addToFavoritesMock).toHaveBeenCalled();
      expect(exportMock).toHaveBeenCalled();
    });
  },
};
