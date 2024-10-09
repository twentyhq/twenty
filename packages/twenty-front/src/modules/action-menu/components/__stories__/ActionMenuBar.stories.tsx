import { expect, jest } from '@storybook/jest';
import { Meta, StoryObj } from '@storybook/react';
import { RecoilRoot } from 'recoil';

import { ActionMenuBar } from '@/action-menu/components/ActionMenuBar';
import { actionMenuEntriesComponentState } from '@/action-menu/states/actionMenuEntriesComponentState';
import { contextStoreTargetedRecordIdsState } from '@/context-store/states/contextStoreTargetedRecordIdsState';
import { isBottomBarOpenComponentState } from '@/ui/layout/bottom-bar/states/isBottomBarOpenComponentState';
import { extractComponentState } from '@/ui/utilities/state/component-state/utils/extractComponentState';
import { userEvent, waitFor, within } from '@storybook/test';
import { IconCheckbox, IconTrash } from 'twenty-ui';

const deleteMock = jest.fn();
const markAsDoneMock = jest.fn();

const meta: Meta<typeof ActionMenuBar> = {
  title: 'Modules/ActionMenu/ActionMenuBar',
  component: ActionMenuBar,
  decorators: [
    (Story) => (
      <RecoilRoot
        initializeState={({ set }) => {
          set(contextStoreTargetedRecordIdsState, ['1', '2', '3']);
          set(
            actionMenuEntriesComponentState.atomFamily({
              instanceId: 'story-action-menu',
            }),
            [
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
            ],
          );
          set(
            extractComponentState(
              isBottomBarOpenComponentState,
              'action-bar-story-action-menu',
            ),
            true,
          );
        }}
      >
        <Story />
      </RecoilRoot>
    ),
  ],
  args: {
    actionMenuId: 'story-action-menu',
  },
};

export default meta;

type Story = StoryObj<typeof ActionMenuBar>;

export const Default: Story = {
  args: {
    actionMenuId: 'story-action-menu',
  },
};

export const WithCustomSelection: Story = {
  args: {
    actionMenuId: 'story-action-menu',
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const selectionText = canvas.getByText('3 selected:');
    expect(selectionText).toBeInTheDocument();
  },
};

export const WithButtonClicks: Story = {
  args: {
    actionMenuId: 'story-action-menu',
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    const deleteButton = canvas.getByText('Delete');
    await userEvent.click(deleteButton);

    const markAsDoneButton = canvas.getByText('Mark as done');
    await userEvent.click(markAsDoneButton);

    await waitFor(() => {
      expect(deleteMock).toHaveBeenCalled();
      expect(markAsDoneMock).toHaveBeenCalled();
    });
  },
};
