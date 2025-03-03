import { COMMAND_MENU_CONTEXT_CHIP_GROUPS_DROPDOWN_ID } from '@/command-menu/constants/CommandMenuContextChipGroupsDropdownId';
import { Dropdown } from '@/ui/layout/dropdown/components/Dropdown';
import { DropdownMenuItemsContainer } from '@/ui/layout/dropdown/components/DropdownMenuItemsContainer';
import { AppHotkeyScope } from '@/ui/utilities/hotkey/types/AppHotkeyScope';
import { isDefined } from 'twenty-shared';
import { MenuItem } from 'twenty-ui';
import {
  CommandMenuContextChip,
  CommandMenuContextChipProps,
} from './CommandMenuContextChip';

export const CommandMenuContextChipGroups = ({
  contextChips,
}: {
  contextChips: CommandMenuContextChipProps[];
}) => {
  if (contextChips.length === 0) {
    return null;
  }

  if (contextChips.length < 3) {
    return (
      <>
        {contextChips.map((chip) => (
          <CommandMenuContextChip
            key={chip.text}
            Icons={chip.Icons}
            text={chip.text}
            onClick={chip.onClick}
          />
        ))}
      </>
    );
  }

  const firstChips = contextChips.slice(0, -1);
  const lastChip = contextChips.at(-1);

  return (
    <>
      {firstChips.length > 0 && (
        <Dropdown
          clickableComponent={
            <CommandMenuContextChip
              Icons={firstChips.map((chip) => chip.Icons?.[0])}
              onClick={() => {}}
            />
          }
          dropdownComponents={
            <DropdownMenuItemsContainer>
              {firstChips.map((chip) => (
                <MenuItem
                  LeftComponent={chip.Icons}
                  text={chip.text}
                  onClick={chip.onClick}
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
        />
      )}
    </>
  );
};
