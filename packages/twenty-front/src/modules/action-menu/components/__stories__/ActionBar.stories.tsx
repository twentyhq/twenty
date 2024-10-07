import { expect, jest } from '@storybook/jest';
import { Meta, StoryObj } from '@storybook/react';
import { RecoilRoot } from 'recoil';

import { ActionBar } from '@/action-menu/components/ActionBar';
import { actionMenuEntriesState } from '@/action-menu/states/actionMenuEntriesState';
import { contextStoreTargetedRecordIdsState } from '@/context-store/states/contextStoreTargetedRecordIdsState';
import { isBottomBarOpenComponentState } from '@/ui/layout/bottom-bar/states/isBottomBarOpenComponentState';
import { extractComponentState } from '@/ui/utilities/state/component-state/utils/extractComponentState';
import { userEvent, waitFor, within } from '@storybook/test';
import { IconCheckbox, IconTrash } from 'twenty-ui';

const deleteMock = jest.fn();
const markAsDoneMock = jest.fn();

const meta: Meta<typeof ActionBar> = {
  title: 'Modules/ActionMenu/ActionBar',
  component: ActionBar,
  decorators: [
    (Story) => (
      <RecoilRoot
        initializeState={({ set }) => {
          set(contextStoreTargetedRecordIdsState, ['1', '2', '3']);
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
          ]);
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

type Story = StoryObj<typeof ActionBar>;

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
