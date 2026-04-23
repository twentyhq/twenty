import { type SettingsFieldType } from '@/settings/data-model/types/SettingsFieldType';
import { Dropdown } from '@/ui/layout/dropdown/components/Dropdown';
import { DropdownContent } from '@/ui/layout/dropdown/components/DropdownContent';
import { DropdownMenuItemsContainer } from '@/ui/layout/dropdown/components/DropdownMenuItemsContainer';
import { useCloseDropdown } from '@/ui/layout/dropdown/hooks/useCloseDropdown';
import { styled } from '@linaria/react';
import { t } from '@lingui/core/macro';
import { useContext } from 'react';
import { useLocation, useParams, useSearchParams } from 'react-router-dom';
import { SettingsPath } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';
import { IconChevronDown } from 'twenty-ui/display';
import { Button } from 'twenty-ui/input';
import { MenuItem } from 'twenty-ui/navigation';
import { ThemeContext, themeCssVariables } from 'twenty-ui/theme-constants';
import { useNavigateSettings } from '~/hooks/useNavigateSettings';

const StyledContainer = styled.div`
  align-items: center;
  color: ${themeCssVariables.font.color.tertiary};
  cursor: default;
  display: flex;
  font-size: ${themeCssVariables.font.size.md};
`;

const StyledButtonContainer = styled.div`
  position: relative;
  width: 100%;
`;

const StyledDownChevronContainer = styled.span`
  align-items: center;
  color: ${themeCssVariables.font.color.primary};
  display: flex;
  position: absolute;
  right: ${themeCssVariables.spacing['1.5']};
  top: 50%;
  transform: translateY(-50%);
`;

const StyledMenuItemWrapper = styled.div<{ disabled?: boolean }>`
  cursor: ${({ disabled }) => (disabled ? 'not-allowed' : 'pointer')};
  width: 100%;
`;

const StyledSpan = styled.span`
  margin-left: ${themeCssVariables.spacing[2]};
`;

const StyledButtonWrapper = styled.div`
  button {
    color: ${themeCssVariables.font.color.primary};
    padding-right: ${themeCssVariables.spacing[6]};
  }
`;

export const SettingsDataModelNewFieldBreadcrumbDropDown = () => {
  const { theme } = useContext(ThemeContext);
  const dropdownId = `settings-object-new-field-breadcrumb-dropdown`;
  const { closeDropdown } = useCloseDropdown();
  const navigate = useNavigateSettings();
  const location = useLocation();
  const { objectNamePlural = '' } = useParams();
  const [searchParams] = useSearchParams();

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
    closeDropdown(dropdownId);
  };

  return (
    <StyledContainer>
      {t`New Field`} <StyledSpan>-</StyledSpan>
      <Dropdown
        dropdownPlacement="bottom-start"
        dropdownId={dropdownId}
        clickableComponent={
          <StyledButtonContainer>
            <StyledDownChevronContainer>
              <IconChevronDown size={theme.icon.size.md} />
            </StyledDownChevronContainer>
            {isConfigureStep ? (
              <StyledButtonWrapper>
                <Button variant="tertiary" title={t`2. Configure`} />
              </StyledButtonWrapper>
            ) : (
              <StyledButtonWrapper>
                <Button variant="tertiary" title={t`1. Type`} />
              </StyledButtonWrapper>
            )}
          </StyledButtonContainer>
        }
        dropdownComponents={
          <DropdownContent>
            <DropdownMenuItemsContainer>
              <StyledMenuItemWrapper>
                <MenuItem
                  text={t`1. Type`}
                  onClick={() => handleClick('select')}
                  selected={!isConfigureStep}
                />
              </StyledMenuItemWrapper>
              <StyledMenuItemWrapper disabled={!isDefined(fieldType)}>
                <MenuItem
                  text={t`2. Configure`}
                  onClick={() => handleClick('configure')}
                  selected={isConfigureStep}
                  disabled={!isDefined(fieldType)}
                />
              </StyledMenuItemWrapper>
            </DropdownMenuItemsContainer>
          </DropdownContent>
        }
      />
    </StyledContainer>
  );
};
