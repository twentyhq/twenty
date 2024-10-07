import { expect, jest } from '@storybook/jest';
import { Meta, StoryObj } from '@storybook/react';
import { userEvent, within } from '@storybook/testing-library';
import { RecoilRoot } from 'recoil';

import { ActionMenuDropdown } from '@/action-menu/components/ActionMenuDropdown';
import { actionMenuDropdownPositionState } from '@/action-menu/states/actionMenuDropdownPositionState';
import { actionMenuEntriesState } from '@/action-menu/states/actionMenuEntriesState';
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
          set(actionMenuDropdownPositionState, { x: 10, y: 10 });
          set(actionMenuEntriesState, [
            {
              label: 'Delete',
              Icon: IconTrash,
              onClick: deleteMock,
            },
            {
              label: 'Mark as done',
              Icon: IconCheckbox,
              onClick: markAsDoneMock,
            },
            {
              label: 'Add to favorites',
              Icon: IconHeart,
              onClick: addToFavoritesMock,
            },
          ]);
          set(
            extractComponentState(
              isDropdownOpenComponentState,
              'action-menu-dropdown-story',
            ),
            true,
          );
        }}
      >
        <div style={{ padding: '100px' }}>
          <Story />
        </div>
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

    const deleteButton = canvas.getByText('Delete');
    await userEvent.click(deleteButton);
    expect(deleteMock).toHaveBeenCalled();

    const markAsDoneButton = canvas.getByText('Mark as done');
    await userEvent.click(markAsDoneButton);
    expect(markAsDoneMock).toHaveBeenCalled();

    const addToFavoritesButton = canvas.getByText('Add to favorites');
    await userEvent.click(addToFavoritesButton);
    expect(addToFavoritesMock).toHaveBeenCalled();
  },
};
