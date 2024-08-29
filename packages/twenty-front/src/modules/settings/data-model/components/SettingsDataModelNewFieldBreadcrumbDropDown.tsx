import { Dropdown } from '@/ui/layout/dropdown/components/Dropdown';
import { DropdownMenu } from '@/ui/layout/dropdown/components/DropdownMenu';
import { DropdownMenuItemsContainer } from '@/ui/layout/dropdown/components/DropdownMenuItemsContainer';
import { MenuItem } from '@/ui/navigation/menu-item/components/MenuItem';
import styled from '@emotion/styled';

type SettingsDataModelNewFieldBreadcrumbDropDownProps = {
  isConfigureStep: boolean;
  onBreadcrumbClick: (isConfigureStep: boolean) => void;
};

const StyledSpan = styled.span`
  color: ${({ theme }) => theme.font.color.primary};
  font-size: ${({ theme }) => theme.font.size.md};
  cursor: pointer;
`;

const StyledMenuItem = styled(MenuItem)`
  cursor: pointer;
`;

export const SettingsDataModelNewFieldBreadcrumbDropDown = ({
  isConfigureStep,
  onBreadcrumbClick,
}: SettingsDataModelNewFieldBreadcrumbDropDownProps) => {
  const dropdownId = `settings-object-new-field-breadcrumb-dropdown`;

  const handleClick = (step: boolean) => {
    onBreadcrumbClick(step);
  };
  return (
    <Dropdown
      dropdownPlacement="bottom"
      dropdownId={dropdownId}
      clickableComponent={
        isConfigureStep ? (
          <StyledSpan>New Field - 2. Configure</StyledSpan>
        ) : (
          <StyledSpan>New Field - 1. Type</StyledSpan>
        )
      }
      dropdownComponents={
        <DropdownMenu>
          <DropdownMenuItemsContainer>
            <StyledMenuItem text="1. Type" onClick={() => handleClick(false)} />

            <StyledMenuItem
              text="2. Configure"
              onClick={() => handleClick(true)}
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
