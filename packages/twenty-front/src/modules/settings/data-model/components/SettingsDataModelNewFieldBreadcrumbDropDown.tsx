import { SettingsFieldType } from '@/settings/data-model/types/SettingsFieldType';
import { SettingsPath } from '@/types/SettingsPath';
import { Dropdown } from '@/ui/layout/dropdown/components/Dropdown';
import { DropdownMenu } from '@/ui/layout/dropdown/components/DropdownMenu';
import { DropdownMenuItemsContainer } from '@/ui/layout/dropdown/components/DropdownMenuItemsContainer';
import { useDropdown } from '@/ui/layout/dropdown/hooks/useDropdown';
import { useTheme } from '@emotion/react';
import styled from '@emotion/styled';
import { useLocation, useParams, useSearchParams } from 'react-router-dom';
import { Button, IconChevronDown, isDefined, MenuItem } from 'twenty-ui';
import { useNavigateSettings } from '~/hooks/useNavigateSettings';

const StyledContainer = styled.div`
  align-items: center;
  color: ${({ theme }) => theme.font.color.tertiary};
  cursor: default;
  display: flex;
  font-size: ${({ theme }) => theme.font.size.md};
`;

const StyledButtonContainer = styled.div`
  position: relative;
  width: 100%;
`;

const StyledDownChevron = styled(IconChevronDown)`
  color: ${({ theme }) => theme.font.color.primary};
  position: absolute;
  right: ${({ theme }) => theme.spacing(1.5)};
  top: 50%;
  transform: translateY(-50%);
`;

const StyledMenuItemWrapper = styled.div<{ disabled?: boolean }>`
  cursor: ${({ disabled }) => (disabled ? 'not-allowed' : 'pointer')};
  width: 100%;
`;

const StyledMenuItem = styled(MenuItem)<{
  selected?: boolean;
  disabled?: boolean;
}>`
  background: ${({ theme, selected }) =>
    selected ? theme.background.quaternary : 'transparent'};
  opacity: ${({ disabled }) => (disabled ? 0.5 : 1)};
  pointer-events: ${({ disabled }) => (disabled ? 'none' : 'auto')};

  &:hover {
    background: ${({ theme, disabled }) =>
      disabled ? 'transparent' : theme.background.tertiary};
  }
`;

const StyledSpan = styled.span`
  margin-left: ${({ theme }) => theme.spacing(2)};
`;

const StyledButton = styled(Button)`
  color: ${({ theme }) => theme.font.color.primary};
  padding-right: ${({ theme }) => theme.spacing(6)};
`;

export const SettingsDataModelNewFieldBreadcrumbDropDown = () => {
  const dropdownId = `settings-object-new-field-breadcrumb-dropdown`;
  const { closeDropdown } = useDropdown(dropdownId);
  const navigate = useNavigateSettings();
  const location = useLocation();
  const { objectNamePlural = '' } = useParams();
  const [searchParams] = useSearchParams();
  const theme = useTheme();

  const fieldType = searchParams.get('fieldType') as SettingsFieldType;
  const isConfigureStep = location.pathname.includes('/configure');

  const handleClick = (step: 'select' | 'configure') => {
    if (step === 'configure' && isDefined(fieldType)) {
      navigate(
        SettingsPath.ObjectNewFieldConfigure,
        { objectNamePlural },
        { fieldType },
      );
    } else {
      navigate(
        SettingsPath.ObjectNewFieldSelect,
        { objectNamePlural },
        fieldType ? { fieldType } : undefined,
      );
    }
    closeDropdown();
  };

  return (
    <StyledContainer>
      New Field <StyledSpan>-</StyledSpan>
      <Dropdown
        dropdownPlacement="bottom-start"
        dropdownId={dropdownId}
        clickableComponent={
          <StyledButtonContainer>
            <StyledDownChevron size={theme.icon.size.md} />
            {isConfigureStep ? (
              <StyledButton variant="tertiary" title="2. Configure" />
            ) : (
              <StyledButton variant="tertiary" title="1. Type" />
            )}
          </StyledButtonContainer>
        }
        dropdownComponents={
          <DropdownMenu>
            <DropdownMenuItemsContainer>
              <StyledMenuItemWrapper>
                <StyledMenuItem
                  text="1. Type"
                  onClick={() => handleClick('select')}
                  selected={!isConfigureStep}
                />
              </StyledMenuItemWrapper>
              <StyledMenuItemWrapper disabled={!isDefined(fieldType)}>
                <StyledMenuItem
                  text="2. Configure"
                  onClick={() => handleClick('configure')}
                  selected={isConfigureStep}
                  disabled={!isDefined(fieldType)}
                />
              </StyledMenuItemWrapper>
            </DropdownMenuItemsContainer>
          </DropdownMenu>
        }
        dropdownHotkeyScope={{ scope: dropdownId }}
      />
    </StyledContainer>
  );
};
