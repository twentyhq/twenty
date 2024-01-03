import { useTheme } from '@emotion/react';
import styled from '@emotion/styled';

import { IconChevronDown } from '@/ui/display/icon';
import { IconComponent } from '@/ui/display/icon/types/IconComponent';
import { Dropdown } from '@/ui/layout/dropdown/components/Dropdown';
import { DropdownMenuItemsContainer } from '@/ui/layout/dropdown/components/DropdownMenuItemsContainer';
import { useDropdown } from '@/ui/layout/dropdown/hooks/useDropdown';
import { DropdownScope } from '@/ui/layout/dropdown/scopes/DropdownScope';
import { MenuItem } from '@/ui/navigation/menu-item/components/MenuItem';

import { SelectHotkeyScope } from '../types/SelectHotkeyScope';

export type SelectProps<Value extends string | number | null> = {
  className?: string;
  disabled?: boolean;
  dropdownScopeId: string;
  fullWidth?: boolean;
  label?: string;
  onChange?: (value: Value) => void;
  options: { value: Value; label: string; Icon?: IconComponent }[];
  value?: Value;
};

const StyledControlContainer = styled.div<{
  disabled?: boolean;
  fullWidth?: boolean;
}>`
  align-items: center;
  background-color: ${({ theme }) => theme.background.transparent.lighter};
  border: 1px solid ${({ theme }) => theme.border.color.medium};
  border-radius: ${({ theme }) => theme.border.radius.sm};
  color: ${({ disabled, theme }) =>
    disabled ? theme.font.color.tertiary : theme.font.color.primary};
  cursor: ${({ disabled }) => (disabled ? 'not-allowed' : 'pointer')};
  display: ${({ fullWidth }) => (fullWidth ? 'flex' : 'inline-flex')};
  gap: ${({ theme }) => theme.spacing(1)};
  height: ${({ theme }) => theme.spacing(8)};
  justify-content: space-between;
  padding: 0 ${({ theme }) => theme.spacing(2)};
`;

const StyledLabel = styled.span`
  color: ${({ theme }) => theme.font.color.light};
  display: block;
  font-size: ${({ theme }) => theme.font.size.xs};
  font-weight: ${({ theme }) => theme.font.weight.semiBold};
  margin-bottom: ${({ theme }) => theme.spacing(1)};
  text-transform: uppercase;
`;

const StyledControlLabel = styled.div`
  align-items: center;
  display: flex;
  gap: ${({ theme }) => theme.spacing(1)};
`;

const StyledIconChevronDown = styled(IconChevronDown)<{ disabled?: boolean }>`
  color: ${({ disabled, theme }) =>
    disabled ? theme.font.color.extraLight : theme.font.color.tertiary};
`;

export const Select = <Value extends string | number | null>({
  className,
  disabled,
  dropdownScopeId,
  fullWidth,
  label,
  onChange,
  options,
  value,
}: SelectProps<Value>) => {
  const theme = useTheme();
  const selectedOption =
    options.find(({ value: key }) => key === value) || options[0];

  const { closeDropdown } = useDropdown(dropdownScopeId);

  const selectControl = (
    <StyledControlContainer disabled={disabled} fullWidth={fullWidth}>
      <StyledControlLabel>
        {!!selectedOption?.Icon && (
          <selectedOption.Icon
            color={disabled ? theme.font.color.light : theme.font.color.primary}
            size={theme.icon.size.md}
            stroke={theme.icon.stroke.sm}
          />
        )}
        {selectedOption?.label}
      </StyledControlLabel>
      <StyledIconChevronDown disabled={disabled} size={theme.icon.size.md} />
    </StyledControlContainer>
  );

  return disabled ? (
    <div>
      {!!label && <StyledLabel>{label}</StyledLabel>}
      {selectControl}
    </div>
  ) : (
    <DropdownScope dropdownScopeId={dropdownScopeId}>
      <div className={className}>
        {!!label && <StyledLabel>{label}</StyledLabel>}
        <Dropdown
          dropdownMenuWidth={176}
          dropdownPlacement="bottom-start"
          clickableComponent={selectControl}
          dropdownComponents={
            <DropdownMenuItemsContainer>
              {options.map((option) => (
                <MenuItem
                  key={option.value}
                  LeftIcon={option.Icon}
                  text={option.label}
                  onClick={() => {
                    onChange?.(option.value);
                    closeDropdown();
                  }}
                />
              ))}
            </DropdownMenuItemsContainer>
          }
          dropdownHotkeyScope={{ scope: SelectHotkeyScope.Select }}
        />
      </div>
    </DropdownScope>
  );
};
