import { SupportButton } from '@/support/components/SupportButton';
import { Dropdown } from '@/ui/layout/dropdown/components/Dropdown';
import { DropdownMenu } from '@/ui/layout/dropdown/components/DropdownMenu';
import { DropdownMenuItemsContainer } from '@/ui/layout/dropdown/components/DropdownMenuItemsContainer';
import { useDropdown } from '@/ui/layout/dropdown/hooks/useDropdown';
import { MenuItem } from '@/ui/navigation/menu-item/components/MenuItem';
import { IconHelpCircle, IconMessage } from 'twenty-ui';

export const SupportDropdown = () => {
  const dropdownId = `support-field-active-action-dropdown`;

  const { closeDropdown } = useDropdown(dropdownId);

  const handleTalkToUs = () => {
    window.FrontChat?.('show');
    closeDropdown();
  };

  const handleUserGuide = () => {
    window.open('https://twenty.com/user-guide', '_blank');
    closeDropdown();
  };

  return (
    <Dropdown
      dropdownId={dropdownId}
      dropdownPlacement="top-start"
      dropdownOffset={{ x: 0, y: -28 }}
      clickableComponent={<SupportButton />}
      dropdownComponents={
        <DropdownMenu width="160px">
          <DropdownMenuItemsContainer>
            <MenuItem
              text="Talk to us"
              LeftIcon={IconMessage}
              onClick={handleTalkToUs}
            />
            <MenuItem
              text="Documentation"
              LeftIcon={IconHelpCircle}
              onClick={handleUserGuide}
            />
          </DropdownMenuItemsContainer>
        </DropdownMenu>
      }
      dropdownHotkeyScope={{
        scope: dropdownId,
      }}
    />
  );
};
