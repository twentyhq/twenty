import { expect, jest } from '@storybook/jest';
import { Meta, StoryObj } from '@storybook/react';
import { RecoilRoot } from 'recoil';

import { ActionMenuBar } from '@/action-menu/components/ActionMenuBar';
import { actionMenuEntriesComponentState } from '@/action-menu/states/actionMenuEntriesComponentState';
import { ActionMenuComponentInstanceContext } from '@/action-menu/states/contexts/ActionMenuComponentInstanceContext';
import { contextStoreTargetedRecordIdsState } from '@/context-store/states/contextStoreTargetedRecordIdsState';
import { isBottomBarOpenedComponentState } from '@/ui/layout/bottom-bar/states/isBottomBarOpenedComponentState';
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
            ]),
          );
          set(
            isBottomBarOpenedComponentState.atomFamily({
              instanceId: 'action-bar-story-action-menu',
            }),
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
    const selectionText = await canvas.findByText('3 selected:');
    expect(selectionText).toBeInTheDocument();
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

    const markAsDoneButton = await canvas.findByText('Mark as done');
    await userEvent.click(markAsDoneButton);

    await waitFor(() => {
      expect(deleteMock).toHaveBeenCalled();
      expect(markAsDoneMock).toHaveBeenCalled();
    });
  },
};
