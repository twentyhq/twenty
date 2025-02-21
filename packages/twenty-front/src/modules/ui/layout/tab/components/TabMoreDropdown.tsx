import { Button, IconComponent } from 'twenty-ui';
import { HotkeyScope } from '@/ui/utilities/hotkey/types/HotkeyScope';
import styled from '@emotion/styled';
import { Dropdown } from '@/ui/layout/dropdown/components/Dropdown';

type MoreTabsDropdownProps = {
  id: string;
  title: string;
  Icon: IconComponent;
  dropdownContent?: React.ReactNode;
  dropdownPlacement?: 'bottom-start' | 'bottom-end' | 'top-start' | 'top-end';
  onDropdownOpen?: () => void;
  onDropdownClose?: () => void;
};

export const MoreTabsDropdown = ({
  id,
  title,
  Icon,
  dropdownContent,
  dropdownPlacement = 'bottom-start',
  onDropdownOpen,
  onDropdownClose,
}: MoreTabsDropdownProps) => {
  if (!dropdownContent) {
    return <Button title={title} Icon={Icon} />;
  }

  const StyledButtonContainer = styled.div`
    height: 100%;
    display: flex;
    align-items: center;
  `;

  // Define a basic hotkey scope for the dropdown
  const dropdownHotkeyScope: HotkeyScope = {
    scope: `dropdown-${id}`,
  };

  return (
    <Dropdown
      dropdownId={`more-button-${id}-dropdown`}
      dropdownHotkeyScope={dropdownHotkeyScope}
      dropdownPlacement={dropdownPlacement}
      dropdownComponents={dropdownContent}
      onOpen={onDropdownOpen}
      onClose={onDropdownClose}
      clickableComponent={
        <StyledButtonContainer>
          <Button
            variant="tertiary"
            size="small"
            title={title}
            Icon={Icon}
            IconPosition="right"
          />
        </StyledButtonContainer>
      }
    />
  );
};
