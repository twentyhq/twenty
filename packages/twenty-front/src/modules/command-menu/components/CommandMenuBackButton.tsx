import { COMMAND_MENU_NAVIGATION_HISTORY_DROPDOWN_ID } from '@/command-menu/constants/CommandMenuNavigationHistoryDropdownId';
import { useCommandMenuContextChips } from '@/command-menu/hooks/useCommandMenuContextChips';
import { useCommandMenuHistory } from '@/command-menu/hooks/useCommandMenuHistory';
import { Dropdown } from '@/ui/layout/dropdown/components/Dropdown';
import { DropdownContent } from '@/ui/layout/dropdown/components/DropdownContent';
import { DropdownMenuItemsContainer } from '@/ui/layout/dropdown/components/DropdownMenuItemsContainer';
import { useCloseDropdown } from '@/ui/layout/dropdown/hooks/useCloseDropdown';
import { useOpenDropdown } from '@/ui/layout/dropdown/hooks/useOpenDropdown';
import styled from '@emotion/styled';
import { IconChevronLeft } from 'twenty-ui/display';
import { IconButton } from 'twenty-ui/input';
import { MenuItem } from 'twenty-ui/navigation';

const StyledNavigationIcon = styled.div`
  align-items: center;
  cursor: pointer;
  display: flex;
  justify-content: center;
`;

const StyledIconChevronLeft = styled(IconChevronLeft)`
  color: ${({ theme }) => theme.font.color.secondary};
`;

export const CommandMenuBackButton = () => {
  const { goBackFromCommandMenu } = useCommandMenuHistory();

  const { contextChips } = useCommandMenuContextChips();

  const { openDropdown } = useOpenDropdown();

  const { closeDropdown } = useCloseDropdown();

  const handleBackButtonContextMenu = (
    event: React.MouseEvent<HTMLDivElement>,
  ) => {
    if (contextChips.length === 0) {
      return;
    }

    event.preventDefault();
    event.stopPropagation();

    openDropdown({
      dropdownComponentInstanceIdFromProps:
        COMMAND_MENU_NAVIGATION_HISTORY_DROPDOWN_ID,
    });
  };

  return (
    <Dropdown
      clickableComponent={
        <StyledNavigationIcon onContextMenu={handleBackButtonContextMenu}>
          <IconButton
            Icon={StyledIconChevronLeft}
            size="small"
            variant="tertiary"
            onClick={goBackFromCommandMenu}
          />
        </StyledNavigationIcon>
      }
      dropdownComponents={
        <DropdownContent>
          <DropdownMenuItemsContainer>
            {contextChips.slice(0, -1).map((chip, index) => (
              <MenuItem
                key={index}
                LeftComponent={chip.Icons}
                onClick={() => {
                  closeDropdown(COMMAND_MENU_NAVIGATION_HISTORY_DROPDOWN_ID);
                  chip.onClick?.();
                }}
                text={chip.text}
              />
            ))}
          </DropdownMenuItemsContainer>
        </DropdownContent>
      }
      dropdownId={COMMAND_MENU_NAVIGATION_HISTORY_DROPDOWN_ID}
      dropdownPlacement="bottom-start"
      disableClickForClickableComponent={true}
    />
  );
};
