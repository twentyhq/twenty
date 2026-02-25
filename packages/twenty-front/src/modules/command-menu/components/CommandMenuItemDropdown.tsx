import {
  CommandMenuItem,
  type CommandMenuItemProps,
} from '@/command-menu/components/CommandMenuItem';
import { COMMAND_MENU_LIST_SELECTABLE_LIST_ID } from '@/command-menu/constants/CommandMenuListSelectableListId';
import {
  Dropdown,
  type DropdownProps,
} from '@/ui/layout/dropdown/components/Dropdown';
import { isDropdownOpenComponentState } from '@/ui/layout/dropdown/states/isDropdownOpenComponentState';
import { useSelectableList } from '@/ui/layout/selectable-list/hooks/useSelectableList';
import { useAtomComponentStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomComponentStateValue';

export type CommandMenuItemDropdownProps = CommandMenuItemProps &
  Pick<
    DropdownProps,
    'dropdownPlacement' | 'dropdownOffset' | 'dropdownId' | 'dropdownComponents'
  >;

export const CommandMenuItemDropdown = ({
  id,
  label,
  Icon,
  hotKeys,
  RightComponent,
  description,
  contextualTextPosition,
  dropdownComponents,
  dropdownPlacement,
  dropdownOffset,
  dropdownId,
  disabled = false,
}: CommandMenuItemDropdownProps) => {
  const isDropdownOpen = useAtomComponentStateValue(
    isDropdownOpenComponentState,
    dropdownId,
  );

  const { setSelectedItemId } = useSelectableList(
    COMMAND_MENU_LIST_SELECTABLE_LIST_ID,
  );

  return (
    <Dropdown
      clickableComponent={
        <CommandMenuItem
          id={id}
          label={label}
          description={description}
          contextualTextPosition={contextualTextPosition}
          Icon={Icon}
          hotKeys={hotKeys}
          RightComponent={RightComponent}
          hasSubMenu
          isSubMenuOpened={isDropdownOpen}
          disabled={disabled}
        />
      }
      dropdownComponents={dropdownComponents}
      dropdownId={dropdownId}
      dropdownPlacement={dropdownPlacement}
      dropdownOffset={dropdownOffset}
      disableClickForClickableComponent={disabled}
      onOpen={() => {
        setSelectedItemId(id);
      }}
      middlewareBoundaryPadding={{
        right: 0,
        left: 0,
      }}
    />
  );
};
