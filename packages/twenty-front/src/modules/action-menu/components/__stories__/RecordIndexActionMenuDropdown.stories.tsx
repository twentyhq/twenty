import { expect, jest } from '@storybook/jest';
import { Meta, StoryObj } from '@storybook/react';
import { userEvent, within } from '@storybook/testing-library';
import { RecoilRoot } from 'recoil';

import { RecordIndexActionMenuDropdown } from '@/action-menu/components/RecordIndexActionMenuDropdown';
import { actionMenuEntriesComponentState } from '@/action-menu/states/actionMenuEntriesComponentState';
import { ActionMenuComponentInstanceContext } from '@/action-menu/states/contexts/ActionMenuComponentInstanceContext';
import { recordIndexActionMenuDropdownPositionComponentState } from '@/action-menu/states/recordIndexActionMenuDropdownPositionComponentState';
import {
  ActionMenuEntry,
  ActionMenuEntryScope,
  ActionMenuEntryType,
} from '@/action-menu/types/ActionMenuEntry';
import { isDropdownOpenComponentState } from '@/ui/layout/dropdown/states/isDropdownOpenComponentState';
import { extractComponentState } from '@/ui/utilities/state/component-state/utils/extractComponentState';
import {
  IconCheckbox,
  IconHeart,
  IconTrash,
  getCanvasElementForDropdownTesting,
} from 'twenty-ui';

const deleteMock = jest.fn();
const markAsDoneMock = jest.fn();
const addToFavoritesMock = jest.fn();

const meta: Meta<typeof RecordIndexActionMenuDropdown> = {
  title: 'Modules/ActionMenu/RecordIndexActionMenuDropdown',
  component: RecordIndexActionMenuDropdown,
  decorators: [
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

          const map = new Map<string, ActionMenuEntry>();

          set(
            actionMenuEntriesComponentState.atomFamily({
              instanceId: 'story-action-menu',
            }),
            map,
          );

          map.set('delete', {
            type: ActionMenuEntryType.Standard,
            scope: ActionMenuEntryScope.RecordSelection,
            key: 'delete',
            label: 'Delete',
            position: 0,
            Icon: IconTrash,
            onClick: deleteMock,
          });

          map.set('markAsDone', {
            type: ActionMenuEntryType.Standard,
            scope: ActionMenuEntryScope.RecordSelection,
            key: 'markAsDone',
            label: 'Mark as done',
            position: 1,
            Icon: IconCheckbox,
            onClick: markAsDoneMock,
          });

          map.set('addToFavorites', {
            type: ActionMenuEntryType.Standard,
            scope: ActionMenuEntryScope.RecordSelection,
            key: 'addToFavorites',
            label: 'Add to favorites',
            position: 2,
            Icon: IconHeart,
            onClick: addToFavoritesMock,
          });

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
          <Story />
        </ActionMenuComponentInstanceContext.Provider>
      </RecoilRoot>
    ),
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
    const canvasElement = getCanvasElementForDropdownTesting();

    const canvas = within(canvasElement);

    const deleteButton = await canvas.findByText('Delete');
    await userEvent.click(deleteButton);
    expect(deleteMock).toHaveBeenCalled();
  },
};
