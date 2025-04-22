import { COMMAND_MENU_CONTEXT_CHIP_GROUPS_DROPDOWN_ID } from '@/command-menu/constants/CommandMenuContextChipGroupsDropdownId';
import { Dropdown } from '@/ui/layout/dropdown/components/Dropdown';
import { DropdownMenuItemsContainer } from '@/ui/layout/dropdown/components/DropdownMenuItemsContainer';
import { useDropdownV2 } from '@/ui/layout/dropdown/hooks/useDropdownV2';
import { AppHotkeyScope } from '@/ui/utilities/hotkey/types/AppHotkeyScope';
import { isDefined } from 'twenty-shared/utils';
import {
  CommandMenuContextChip,
  CommandMenuContextChipProps,
} from './CommandMenuContextChip';
import { MenuItem } from 'twenty-ui/navigation';

export const CommandMenuContextChipGroups = ({
  contextChips,
}: {
  contextChips: CommandMenuContextChipProps[];
}) => {
  const { closeDropdown } = useDropdownV2();

  if (contextChips.length === 0) {
    return null;
  }

  if (contextChips.length < 3) {
    return (
      <>
        {contextChips.map((chip, index) => (
          <CommandMenuContextChip
            key={index}
            maxWidth={'180px'}
            Icons={chip.Icons}
            text={chip.text}
            onClick={chip.onClick}
          />
        ))}
      </>
    );
  }

  const firstChips = contextChips.slice(0, -1);
  const firstThreeChips = firstChips.slice(0, 3);
  const lastChip = contextChips.at(-1);

  return (
    <>
      {firstChips.length > 0 && (
        <Dropdown
          clickableComponent={
            <CommandMenuContextChip
              Icons={firstThreeChips.map((chip) => chip.Icons?.[0])}
              onClick={() => {}}
              text={`${firstChips.length}`}
            />
          }
          dropdownComponents={
            <DropdownMenuItemsContainer>
              {firstChips.map((chip, index) => (
                <MenuItem
                  key={index}
                  LeftComponent={chip.Icons}
                  text={chip.text}
                  onClick={() => {
                    closeDropdown(COMMAND_MENU_CONTEXT_CHIP_GROUPS_DROPDOWN_ID);
                    chip.onClick?.();
                  }}
                />
              ))}
            </DropdownMenuItemsContainer>
          }
          dropdownHotkeyScope={{
            scope: AppHotkeyScope.CommandMenu,
          }}
          dropdownId={COMMAND_MENU_CONTEXT_CHIP_GROUPS_DROPDOWN_ID}
          dropdownPlacement="bottom-start"
        ></Dropdown>
      )}

      {isDefined(lastChip) && (
        <CommandMenuContextChip
          Icons={lastChip.Icons}
          text={lastChip.text}
          onClick={lastChip.onClick}
          maxWidth={'180px'}
        />
      )}
    </>
  );
};
