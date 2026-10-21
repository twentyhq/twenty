import { NavigationMenuItemSelectableItem } from '@/navigation-menu-item/edit/components/NavigationMenuItemSelectableItem';
import { DropdownRoot } from '@/ui/layout/dropdown/components/DropdownRoot';
import { DropdownContent } from '@/ui/layout/dropdown/components/DropdownContent';
import { isDropdownOpenComponentState } from '@/ui/layout/dropdown/states/isDropdownOpenComponentState';
import { Dropdown } from 'twenty-ui/components/navigation';
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
  <DropdownRoot dropdownId={FOCUS_ID} type="menu">
    <DropdownContent aria-label="Choose destination">
      <Dropdown.Section>
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
      </Dropdown.Section>
    </DropdownContent>
  </DropdownRoot>
);

const meta: Meta<typeof NavigationMenuItemSelectableItems> = {
  title: 'Modules/NavigationMenuItem/NavigationMenuItemSelectableItem',
  component: NavigationMenuItemSelectableItems,
  decorators: [ComponentDecorator],
  beforeEach: () => {
    onChooseUnavailableDestination.mockClear();
    onChooseDestination.mockClear();
    jotaiStore.set(
      isDropdownOpenComponentState.atomFamily({ instanceId: FOCUS_ID }),
      true,
    );
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
    const canvas = within(canvasElement.ownerDocument.body);

    await expect(
      await canvas.findByRole('menuitem', { name: 'Unavailable destination' }),
    ).toBeDisabled();
    await userEvent.click(await canvas.findByText('Unavailable destination'));
    await expect(onChooseUnavailableDestination).not.toHaveBeenCalled();

    await userEvent.keyboard('{ArrowDown}{Enter}');
    await expect(onChooseDestination).toHaveBeenCalledTimes(1);
  },
};
