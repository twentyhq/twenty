import { SupportButton } from '@/support/components/SupportButton';
import { Dropdown } from '@/ui/layout/dropdown/components/Dropdown';
import { DropdownContent } from '@/ui/layout/dropdown/components/DropdownContent';
import { DropdownMenuItemsContainer } from '@/ui/layout/dropdown/components/DropdownMenuItemsContainer';
import { GenericDropdownContentWidth } from '@/ui/layout/dropdown/constants/GenericDropdownContentWidth';
import { useCloseDropdown } from '@/ui/layout/dropdown/hooks/useCloseDropdown';
import { IconHelpCircle, IconMessage } from 'twenty-ui/display';
import { MenuItem } from 'twenty-ui/navigation';

export const SupportDropdown = () => {
  const dropdownId = `support-field-active-action-dropdown`;

  const { closeDropdown } = useCloseDropdown();

  const handleTalkToUs = () => {
    window.FrontChat?.('show');
    closeDropdown(dropdownId);
  };

  const handleUserGuide = () => {
    window.open('https://twenty.com/user-guide', '_blank');
    closeDropdown(dropdownId);
  };

  return (
    <Dropdown
      dropdownId={dropdownId}
      dropdownPlacement="top-start"
      dropdownOffset={{ x: 0, y: -28 }}
      clickableComponent={<SupportButton />}
      dropdownComponents={
        <DropdownContent widthInPixels={GenericDropdownContentWidth.Narrow}>
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
        </DropdownContent>
      }
    />
  );
};
