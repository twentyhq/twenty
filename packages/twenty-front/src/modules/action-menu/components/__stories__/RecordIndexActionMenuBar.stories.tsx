import { expect, jest } from '@storybook/jest';
import { Meta, StoryObj } from '@storybook/react';
import { RecoilRoot } from 'recoil';

import { RecordIndexActionMenuBar } from '@/action-menu/components/RecordIndexActionMenuBar';
import { actionMenuEntriesComponentState } from '@/action-menu/states/actionMenuEntriesComponentState';
import { ActionMenuComponentInstanceContext } from '@/action-menu/states/contexts/ActionMenuComponentInstanceContext';
import { ContextStoreComponentInstanceContext } from '@/context-store/states/contexts/ContextStoreComponentInstanceContext';
import { contextStoreNumberOfSelectedRecordsComponentState } from '@/context-store/states/contextStoreNumberOfSelectedRecordsComponentState';
import { contextStoreTargetedRecordsRuleComponentState } from '@/context-store/states/contextStoreTargetedRecordsRuleComponentState';
import { isBottomBarOpenedComponentState } from '@/ui/layout/bottom-bar/states/isBottomBarOpenedComponentState';
import { userEvent, waitFor, within } from '@storybook/test';
import { IconCheckbox, IconTrash } from 'twenty-ui';

const deleteMock = jest.fn();
const markAsDoneMock = jest.fn();

const meta: Meta<typeof RecordIndexActionMenuBar> = {
  title: 'Modules/ActionMenu/RecordIndexActionMenuBar',
  component: RecordIndexActionMenuBar,
  decorators: [
    (Story) => (
      <ContextStoreComponentInstanceContext.Provider
        value={{ instanceId: 'story-action-menu' }}
      >
        <RecoilRoot
          initializeState={({ set }) => {
            set(
              contextStoreTargetedRecordsRuleComponentState.atomFamily({
                instanceId: 'story-action-menu',
              }),
              {
                mode: 'selection',
                selectedRecordIds: ['1', '2', '3'],
              },
            );
            set(
              contextStoreNumberOfSelectedRecordsComponentState.atomFamily({
                instanceId: 'story-action-menu',
              }),
              3,
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
      </ContextStoreComponentInstanceContext.Provider>
    ),
  ],
  args: {
    actionMenuId: 'story-action-menu',
  },
};

export default meta;

type Story = StoryObj<typeof RecordIndexActionMenuBar>;

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
