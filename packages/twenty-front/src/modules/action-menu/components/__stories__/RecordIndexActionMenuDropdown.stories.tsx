import { expect, jest } from '@storybook/jest';
import { Meta, StoryObj } from '@storybook/react';
import { userEvent, waitFor, within } from '@storybook/testing-library';
import { RecoilRoot } from 'recoil';

import { Action } from '@/action-menu/actions/components/Action';
import { SingleRecordActionKeys } from '@/action-menu/actions/record-actions/single-record/types/SingleRecordActionsKey';
import { ActionScope } from '@/action-menu/actions/types/ActionScope';
import { ActionType } from '@/action-menu/actions/types/ActionType';
import { ActionViewType } from '@/action-menu/actions/types/ActionViewType';
import { RecordIndexActionMenuDropdown } from '@/action-menu/components/RecordIndexActionMenuDropdown';
import { ActionMenuContext } from '@/action-menu/contexts/ActionMenuContext';
import { ActionMenuComponentInstanceContext } from '@/action-menu/states/contexts/ActionMenuComponentInstanceContext';
import { recordIndexActionMenuDropdownPositionComponentState } from '@/action-menu/states/recordIndexActionMenuDropdownPositionComponentState';
import { isDropdownOpenComponentState } from '@/ui/layout/dropdown/states/isDropdownOpenComponentState';
import { extractComponentState } from '@/ui/utilities/state/component-state/utils/extractComponentState';
import { msg } from '@lingui/core/macro';
import { IconFileExport, IconHeart, IconTrash } from 'twenty-ui/display';
import { getCanvasElementForDropdownTesting } from 'twenty-ui/testing';
import { ContextStoreDecorator } from '~/testing/decorators/ContextStoreDecorator';
import { I18nFrontDecorator } from '~/testing/decorators/I18nFrontDecorator';

const deleteMock = jest.fn();
const addToFavoritesMock = jest.fn();
const exportMock = jest.fn();

const meta: Meta<typeof RecordIndexActionMenuDropdown> = {
  title: 'Modules/ActionMenu/RecordIndexActionMenuDropdown',
  component: RecordIndexActionMenuDropdown,
  decorators: [
    I18nFrontDecorator,
    (Story) => (
      <RecoilRoot
        initializeState={({ set }) => {
          set(
            extractComponentState(
              recordIndexActionMenuDropdownPositionComponentState,
              'action-menu-dropdown-story',
            ),
            { x: 10, y: 10 },
          );

          set(
            extractComponentState(
              isDropdownOpenComponentState,
              'action-menu-dropdown-story-action-menu',
            ),
            true,
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
              actionMenuType: 'index-page-action-menu-dropdown',
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
                  shouldBeRegistered: () => true,
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
                  shouldBeRegistered: () => true,
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
                  shouldBeRegistered: () => true,
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
    ContextStoreDecorator,
  ],
};

export default meta;

type Story = StoryObj<typeof RecordIndexActionMenuDropdown>;

export const Default: Story = {
  args: {
    actionMenuId: 'story',
  },
};

export const WithInteractions: Story = {
  args: {
    actionMenuId: 'story',
  },
  play: async () => {
    const canvas = within(getCanvasElementForDropdownTesting());

    const deleteButton = await canvas.findByText('Delete');
    await userEvent.click(deleteButton);

    const addToFavoritesButton = await canvas.findByText('Add to favorites');
    await userEvent.click(addToFavoritesButton);

    const exportButton = await canvas.findByText('Export');
    await userEvent.click(exportButton);

    const moreActionsButton = await canvas.findByText('More actions');

    await waitFor(() => {
      expect(deleteMock).toHaveBeenCalled();
      expect(addToFavoritesMock).toHaveBeenCalled();
      expect(exportMock).toHaveBeenCalled();
      expect(moreActionsButton).toBeInTheDocument();
    });
  },
};
