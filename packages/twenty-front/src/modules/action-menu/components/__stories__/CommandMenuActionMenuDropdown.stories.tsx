import { expect, jest } from '@storybook/jest';
import { Meta, StoryObj } from '@storybook/react';
import { RecoilRoot } from 'recoil';

import { Action } from '@/action-menu/actions/components/Action';
import { SingleRecordActionKeys } from '@/action-menu/actions/record-actions/single-record/types/SingleRecordActionsKey';
import { ActionScope } from '@/action-menu/actions/types/ActionScope';
import { ActionType } from '@/action-menu/actions/types/ActionType';
import { ActionViewType } from '@/action-menu/actions/types/ActionViewType';
import { CommandMenuActionMenuDropdown } from '@/action-menu/components/CommandMenuActionMenuDropdown';
import { ActionMenuContext } from '@/action-menu/contexts/ActionMenuContext';
import { ActionMenuComponentInstanceContext } from '@/action-menu/states/contexts/ActionMenuComponentInstanceContext';
import { contextStoreNumberOfSelectedRecordsComponentState } from '@/context-store/states/contextStoreNumberOfSelectedRecordsComponentState';
import { contextStoreTargetedRecordsRuleComponentState } from '@/context-store/states/contextStoreTargetedRecordsRuleComponentState';
import { msg } from '@lingui/core/macro';
import { userEvent, waitFor, within } from '@storybook/test';
import { isDefined } from 'twenty-shared/utils';
import { IconFileExport, IconHeart, IconTrash } from 'twenty-ui/display';
import {
  ComponentDecorator,
  getCanvasElementForDropdownTesting,
} from 'twenty-ui/testing';
import { ContextStoreDecorator } from '~/testing/decorators/ContextStoreDecorator';
import { I18nFrontDecorator } from '~/testing/decorators/I18nFrontDecorator';

const deleteMock = jest.fn();
const addToFavoritesMock = jest.fn();
const exportMock = jest.fn();

const meta: Meta<typeof CommandMenuActionMenuDropdown> = {
  title: 'Modules/ActionMenu/CommandMenuActionMenuDropdown',
  component: CommandMenuActionMenuDropdown,
  decorators: [
    I18nFrontDecorator,
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
        }}
      >
        <ActionMenuComponentInstanceContext.Provider
          value={{ instanceId: 'story-action-menu' }}
        >
          <ActionMenuContext.Provider
            value={{
              isInRightDrawer: true,
              displayType: 'dropdownItem',
              actionMenuType: 'command-menu-show-page-action-menu-dropdown',
              actions: [
                {
                  type: ActionType.Standard,
                  scope: ActionScope.RecordSelection,
                  key: SingleRecordActionKeys.ADD_TO_FAVORITES,
                  label: msg`Add to favorites`,
                  shortLabel: msg`Add to favorites`,
                  position: 2,
                  isPinned: true,
                  Icon: IconHeart,
                  shouldBeRegistered: ({ selectedRecord, isFavorite }) =>
                    !selectedRecord?.isRemote && !isFavorite,
                  availableOn: [
                    ActionViewType.INDEX_PAGE_SINGLE_RECORD_SELECTION,
                    ActionViewType.SHOW_PAGE,
                  ],
                  component: <Action onClick={addToFavoritesMock} />,
                },
                {
                  type: ActionType.Standard,
                  scope: ActionScope.RecordSelection,
                  key: SingleRecordActionKeys.EXPORT,
                  label: msg`Export`,
                  shortLabel: msg`Export`,
                  position: 4,
                  Icon: IconFileExport,
                  accent: 'default',
                  isPinned: false,
                  shouldBeRegistered: ({ selectedRecord }) =>
                    isDefined(selectedRecord) && !selectedRecord.isRemote,
                  availableOn: [
                    ActionViewType.SHOW_PAGE,
                    ActionViewType.INDEX_PAGE_SINGLE_RECORD_SELECTION,
                  ],
                  component: <Action onClick={exportMock} />,
                },
                {
                  type: ActionType.Standard,
                  scope: ActionScope.RecordSelection,
                  key: SingleRecordActionKeys.DELETE,
                  label: msg`Delete`,
                  shortLabel: msg`Delete`,
                  position: 7,
                  Icon: IconTrash,
                  accent: 'default',
                  isPinned: true,
                  shouldBeRegistered: ({ selectedRecord }) =>
                    isDefined(selectedRecord) && !selectedRecord.isRemote,
                  availableOn: [
                    ActionViewType.INDEX_PAGE_SINGLE_RECORD_SELECTION,
                    ActionViewType.SHOW_PAGE,
                  ],
                  component: <Action onClick={deleteMock} />,
                },
              ],
            }}
          >
            <Story />
          </ActionMenuContext.Provider>
        </ActionMenuComponentInstanceContext.Provider>
      </RecoilRoot>
    ),
    ComponentDecorator,
    ContextStoreDecorator,
  ],
  args: {
    actionMenuId: 'story-action-menu',
  },
};

export default meta;

type Story = StoryObj<typeof CommandMenuActionMenuDropdown>;

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

    let actionButton = await canvas.findByText('Options');
    await userEvent.click(actionButton);

    const deleteButton = await canvas.findByText('Delete');
    await userEvent.click(deleteButton);

    actionButton = await canvas.findByText('Options');
    await userEvent.click(actionButton);

    const addToFavoritesButton = await canvas.findByText('Add to favorites');
    await userEvent.click(addToFavoritesButton);

    actionButton = await canvas.findByText('Options');
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
