import { SupportButton } from '@/support/components/SupportButton';
import { Dropdown } from '@/ui/layout/dropdown/components/Dropdown';
import { DropdownMenuItemsContainer } from '@/ui/layout/dropdown/components/DropdownMenuItemsContainer';
import { useDropdown } from '@/ui/layout/dropdown/hooks/useDropdown';
import { IconHelpCircle, IconMessage } from 'twenty-ui/display';
import { MenuItem } from 'twenty-ui/navigation';

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
      dropdownWidth={160}
      dropdownComponents={
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
      }
      dropdownHotkeyScope={{ scope: dropdownId }}
    />
  );
};
