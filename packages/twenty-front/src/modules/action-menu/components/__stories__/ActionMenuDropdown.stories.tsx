import { expect, jest } from '@storybook/jest';
import { Meta, StoryObj } from '@storybook/react';
import { userEvent, within } from '@storybook/testing-library';
import { RecoilRoot } from 'recoil';

import { ActionMenuDropdown } from '@/action-menu/components/ActionMenuDropdown';
import { actionMenuDropdownPositionComponentState } from '@/action-menu/states/actionMenuDropdownPositionComponentState';
import { actionMenuEntriesComponentState } from '@/action-menu/states/actionMenuEntriesComponentState';
import { ActionMenuComponentInstanceContext } from '@/action-menu/states/contexts/ActionMenuComponentInstanceContext';
import { isDropdownOpenComponentState } from '@/ui/layout/dropdown/states/isDropdownOpenComponentState';
import { extractComponentState } from '@/ui/utilities/state/component-state/utils/extractComponentState';
import { IconCheckbox, IconHeart, IconTrash } from 'twenty-ui';

const deleteMock = jest.fn();
const markAsDoneMock = jest.fn();
const addToFavoritesMock = jest.fn();

const meta: Meta<typeof ActionMenuDropdown> = {
  title: 'Modules/ActionMenu/ActionMenuDropdown',
  component: ActionMenuDropdown,
  decorators: [
    (Story) => (
      <RecoilRoot
        initializeState={({ set }) => {
          set(
            extractComponentState(
              actionMenuDropdownPositionComponentState,
              'action-menu-dropdown-story',
            ),
            { x: 10, y: 10 },
          );
          set(
            actionMenuEntriesComponentState.atomFamily({
              instanceId: 'story-action-menu',
            }),
            new Map([
              [
                'delete',
                {
                  key: 'delete',
                  label: 'Delete',
                  position: 0,
                  Icon: IconTrash,
                  onClick: deleteMock,
                },
              ],
              [
                'markAsDone',
                {
                  key: 'markAsDone',
                  label: 'Mark as done',
                  position: 1,
                  Icon: IconCheckbox,
                  onClick: markAsDoneMock,
                },
              ],
              [
                'addToFavorites',
                {
                  key: 'addToFavorites',
                  label: 'Add to favorites',
                  position: 2,
                  Icon: IconHeart,
                  onClick: addToFavoritesMock,
                },
              ],
            ]),
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
          <Story />
        </ActionMenuComponentInstanceContext.Provider>
      </RecoilRoot>
    ),
  ],
};

export default meta;

type Story = StoryObj<typeof ActionMenuDropdown>;

export const Default: Story = {
  args: {
    actionMenuId: 'story',
  },
};

export const WithInteractions: Story = {
  args: {
    actionMenuId: 'story',
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    const deleteButton = await canvas.findByText('Delete');
    await userEvent.click(deleteButton);
    expect(deleteMock).toHaveBeenCalled();

    const markAsDoneButton = await canvas.findByText('Mark as done');
    await userEvent.click(markAsDoneButton);
    expect(markAsDoneMock).toHaveBeenCalled();

    const addToFavoritesButton = await canvas.findByText('Add to favorites');
    await userEvent.click(addToFavoritesButton);
    expect(addToFavoritesMock).toHaveBeenCalled();
  },
};
