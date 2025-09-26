import {
  CommandMenuItem,
  type CommandMenuItemProps,
} from '@/command-menu/components/CommandMenuItem';
import {
  Dropdown,
  type DropdownProps,
} from '@/ui/layout/dropdown/components/Dropdown';
import { isDropdownOpenComponentState } from '@/ui/layout/dropdown/states/isDropdownOpenComponentState';
import { useRecoilComponentValue } from '@/ui/utilities/state/component-state/hooks/useRecoilComponentValue';

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
}: CommandMenuItemDropdownProps) => {
  const isDropdownOpen = useRecoilComponentValue(
    isDropdownOpenComponentState,
    dropdownId,
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
        />
      }
      dropdownComponents={dropdownComponents}
      dropdownId={dropdownId}
      dropdownPlacement={dropdownPlacement}
      dropdownOffset={dropdownOffset}
    />
  );
};
