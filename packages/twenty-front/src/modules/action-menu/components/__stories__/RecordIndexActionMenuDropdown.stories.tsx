import { expect, jest } from '@storybook/jest';
import { Meta, StoryObj } from '@storybook/react';
import { userEvent, within } from '@storybook/testing-library';
import { RecoilRoot } from 'recoil';

import { ActionConfig } from '@/action-menu/actions/types/ActionConfig';
import { ActionScope } from '@/action-menu/actions/types/ActionScope';
import { ActionType } from '@/action-menu/actions/types/ActionType';
import { RecordIndexActionMenuDropdown } from '@/action-menu/components/RecordIndexActionMenuDropdown';
import { ActionMenuComponentInstanceContext } from '@/action-menu/states/contexts/ActionMenuComponentInstanceContext';
import { recordIndexActionMenuDropdownPositionComponentState } from '@/action-menu/states/recordIndexActionMenuDropdownPositionComponentState';
import { isDropdownOpenComponentState } from '@/ui/layout/dropdown/states/isDropdownOpenComponentState';
import { extractComponentState } from '@/ui/utilities/state/component-state/utils/extractComponentState';
import { msg } from '@lingui/core/macro';
import { IconCheckbox, IconHeart, IconTrash } from 'twenty-ui/display';
import { getCanvasElementForDropdownTesting } from 'twenty-ui/testing';
import { I18nFrontDecorator } from '~/testing/decorators/I18nFrontDecorator';

const deleteMock = jest.fn();
const markAsDoneMock = jest.fn();
const addToFavoritesMock = jest.fn();

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

          const map = new Map<string, ActionConfig>();

          map.set('delete', {
            type: ActionType.Standard,
            scope: ActionScope.RecordSelection,
            key: 'delete',
            label: msg`Delete`,
            position: 0,
            Icon: IconTrash,
            onClick: deleteMock,
          });

          map.set('markAsDone', {
            type: ActionType.Standard,
            scope: ActionScope.RecordSelection,
            key: 'markAsDone',
            label: msg`Mark as done`,
            position: 1,
            Icon: IconCheckbox,
            onClick: markAsDoneMock,
          });

          map.set('addToFavorites', {
            type: ActionType.Standard,
            scope: ActionScope.RecordSelection,
            key: 'addToFavorites',
            label: msg`Add to favorites`,
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
