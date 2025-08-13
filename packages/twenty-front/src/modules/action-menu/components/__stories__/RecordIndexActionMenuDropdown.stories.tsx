import { expect, userEvent, waitFor, within } from '@storybook/test';
import * as test from '@storybook/test';
import { type Meta, type StoryObj } from '@storybook/react';
import { RecoilRoot } from 'recoil';

import { RecordIndexActionMenuDropdown } from '@/action-menu/components/RecordIndexActionMenuDropdown';
import { ActionMenuContext } from '@/action-menu/contexts/ActionMenuContext';
import { createMockActionMenuActions } from '@/action-menu/mock/action-menu-actions.mock';
import { ActionMenuComponentInstanceContext } from '@/action-menu/states/contexts/ActionMenuComponentInstanceContext';
import { recordIndexActionMenuDropdownPositionComponentState } from '@/action-menu/states/recordIndexActionMenuDropdownPositionComponentState';

import { isDropdownOpenComponentState } from '@/ui/layout/dropdown/states/isDropdownOpenComponentState';
import {
  RouterDecorator,
  getCanvasElementForDropdownTesting,
} from 'twenty-ui/testing';
import { ContextStoreDecorator } from '~/testing/decorators/ContextStoreDecorator';
import { I18nFrontDecorator } from '~/testing/decorators/I18nFrontDecorator';

const deleteMock = test.fn();
const addToFavoritesMock = test.fn();
const exportMock = test.fn();

const meta: Meta<typeof RecordIndexActionMenuDropdown> = {
  title: 'Modules/ActionMenu/RecordIndexActionMenuDropdown',
  component: RecordIndexActionMenuDropdown,
  decorators: [
    I18nFrontDecorator,
    (Story) => (
      <RecoilRoot
        initializeState={({ set }) => {
          set(
            recordIndexActionMenuDropdownPositionComponentState.atomFamily({
              instanceId: 'action-menu-dropdown-story',
            }),
            { x: 10, y: 10 },
          );

          set(
            isDropdownOpenComponentState.atomFamily({
              instanceId: 'action-menu-dropdown-story-action-menu',
            }),
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
              actions: createMockActionMenuActions({
                deleteMock,
                addToFavoritesMock,
                exportMock,
              }),
            }}
          >
            <Story />
          </ActionMenuContext.Provider>
        </ActionMenuComponentInstanceContext.Provider>
      </RecoilRoot>
    ),
    ContextStoreDecorator,
    RouterDecorator,
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
