import { CommandMenuLastContextChip } from '@/command-menu/components/CommandMenuLastContextChip';
import { COMMAND_MENU_CONTEXT_CHIP_GROUPS_DROPDOWN_ID } from '@/command-menu/constants/CommandMenuContextChipGroupsDropdownId';
import { Dropdown } from '@/ui/layout/dropdown/components/Dropdown';
import { DropdownContent } from '@/ui/layout/dropdown/components/DropdownContent';
import { DropdownMenuItemsContainer } from '@/ui/layout/dropdown/components/DropdownMenuItemsContainer';
import { useCloseDropdown } from '@/ui/layout/dropdown/hooks/useCloseDropdown';
import { MenuItem } from 'twenty-ui/navigation';
import {
  CommandMenuContextChip,
  type CommandMenuContextChipProps,
} from './CommandMenuContextChip';

export const CommandMenuContextChipGroups = ({
  contextChips,
}: {
  contextChips: CommandMenuContextChipProps[];
}) => {
  const { closeDropdown } = useCloseDropdown();

  if (contextChips.length === 0) {
    return null;
  }

  const lastChip = contextChips.at(-1);
  const firstChips = contextChips.slice(0, -1);

  if (contextChips.length < 3) {
    return (
      <>
        {firstChips.map((chip, index) => (
          <CommandMenuContextChip
            key={index}
            Icons={chip.Icons}
            maxWidth="180px"
            onClick={chip.onClick}
            text={chip.text}
          />
        ))}
        <CommandMenuLastContextChip lastChip={lastChip} />
      </>
    );
  }

  const firstThreeChips = firstChips.slice(0, 3);

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
            <DropdownContent>
              <DropdownMenuItemsContainer>
                {firstChips.map((chip, index) => (
                  <MenuItem
                    key={index}
                    LeftComponent={chip.Icons}
                    onClick={() => {
                      closeDropdown(
                        COMMAND_MENU_CONTEXT_CHIP_GROUPS_DROPDOWN_ID,
                      );
                      chip.onClick?.();
                    }}
                    text={chip.text}
                  />
                ))}
              </DropdownMenuItemsContainer>
            </DropdownContent>
          }
          dropdownId={COMMAND_MENU_CONTEXT_CHIP_GROUPS_DROPDOWN_ID}
          dropdownPlacement="bottom-start"
        />
      )}
      <CommandMenuLastContextChip lastChip={lastChip} />
    </>
  );
};
