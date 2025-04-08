import { expect, jest } from '@storybook/jest';
import { Meta, StoryObj } from '@storybook/react';
import { RecoilRoot } from 'recoil';

import { ActionConfig } from '@/action-menu/actions/types/ActionConfig';
import { ActionScope } from '@/action-menu/actions/types/ActionScope';
import { ActionType } from '@/action-menu/actions/types/ActionType';
import { CommandMenuActionMenuDropdown } from '@/action-menu/components/CommandMenuActionMenuDropdown';
import { ActionMenuComponentInstanceContext } from '@/action-menu/states/contexts/ActionMenuComponentInstanceContext';
import { contextStoreNumberOfSelectedRecordsComponentState } from '@/context-store/states/contextStoreNumberOfSelectedRecordsComponentState';
import { contextStoreTargetedRecordsRuleComponentState } from '@/context-store/states/contextStoreTargetedRecordsRuleComponentState';
import { msg } from '@lingui/core/macro';
import { userEvent, waitFor, within } from '@storybook/test';
import { IconFileExport, IconHeart, IconTrash } from 'twenty-ui/display';
import { MenuItemAccent } from 'twenty-ui/navigation';
import {
  ComponentDecorator,
  getCanvasElementForDropdownTesting,
} from 'twenty-ui/testing';
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

          const map = new Map<string, ActionConfig>();

          map.set('addToFavorites', {
            type: ActionType.Standard,
            scope: ActionScope.RecordSelection,
            key: 'addToFavorites',
            label: msg`Add to favorites`,
            position: 0,
            Icon: IconHeart,
            onClick: addToFavoritesMock,
          });

          map.set('export', {
            type: ActionType.Standard,
            scope: ActionScope.RecordSelection,
            key: 'export',
            label: msg`Export`,
            position: 1,
            Icon: IconFileExport,
            onClick: exportMock,
          });

          map.set('delete', {
            type: ActionType.Standard,
            scope: ActionScope.RecordSelection,
            key: 'delete',
            label: msg`Delete`,
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
