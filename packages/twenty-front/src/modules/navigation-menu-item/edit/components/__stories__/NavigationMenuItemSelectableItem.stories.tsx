import { NavigationMenuItemSelectableItem } from '@/navigation-menu-item/edit/components/NavigationMenuItemSelectableItem';
import { SelectableList } from '@/ui/layout/selectable-list/components/SelectableList';
import { focusStackState } from '@/ui/utilities/focus/states/focusStackState';
import { FocusComponentType } from '@/ui/utilities/focus/types/FocusComponentType';
import { jotaiStore } from '@/ui/utilities/state/jotai/jotaiStore';
import { type Meta, type StoryObj } from '@storybook/react-vite';
import { expect, fn, userEvent, within } from 'storybook/test';
import { ComponentDecorator } from 'twenty-ui/testing';

const FOCUS_ID = 'navigation-menu-item-selectable-item-story';
const onChooseUnavailableDestination = fn();
const onChooseDestination = fn();

const NavigationMenuItemSelectableItems = () => (
  <SelectableList
    selectableListInstanceId={FOCUS_ID}
    focusId={FOCUS_ID}
    selectableItemIdArray={['unavailable-destination', 'destination']}
  >
    <NavigationMenuItemSelectableItem
      item={{
        id: 'unavailable-destination',
        label: 'Unavailable destination',
        isDisabled: true,
        onClick: onChooseUnavailableDestination,
      }}
    />
    <NavigationMenuItemSelectableItem
      item={{
        id: 'destination',
        label: 'Choose destination',
        onClick: onChooseDestination,
      }}
    />
  </SelectableList>
);

const meta: Meta<typeof NavigationMenuItemSelectableItems> = {
  title: 'Modules/NavigationMenuItem/NavigationMenuItemSelectableItem',
  component: NavigationMenuItemSelectableItems,
  decorators: [ComponentDecorator],
  beforeEach: () => {
    onChooseUnavailableDestination.mockClear();
    onChooseDestination.mockClear();
    jotaiStore.set(focusStackState.atom, [
      {
        focusId: FOCUS_ID,
        componentInstance: {
          componentType: FocusComponentType.DROPDOWN,
          componentInstanceId: FOCUS_ID,
        },
        globalHotkeysConfig: {
          enableGlobalHotkeysWithModifiers: true,
          enableGlobalHotkeysConflictingWithKeyboard: true,
        },
      },
    ]);
  },
};

export default meta;
type Story = StoryObj<typeof NavigationMenuItemSelectableItems>;

export const IgnoresDisabledDestination: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    await userEvent.keyboard('{Enter}');
    await userEvent.click(await canvas.findByText('Unavailable destination'));
    await expect(onChooseUnavailableDestination).not.toHaveBeenCalled();

    await userEvent.keyboard('{ArrowDown}{Enter}');
    await expect(onChooseDestination).toHaveBeenCalledTimes(1);
  },
};
