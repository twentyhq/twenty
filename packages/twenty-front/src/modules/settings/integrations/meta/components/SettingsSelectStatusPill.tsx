/* eslint-disable @nx/workspace-no-hardcoded-colors */
import { useTheme } from '@emotion/react';
import styled from '@emotion/styled';
import { useRef } from 'react';
import { IconComponent } from 'twenty-ui/display';

import { SelectStatusPillItem } from '@/settings/integrations/meta/components/SettingsStatusPillItem';
import { SelectHotkeyScope } from '@/ui/input/types/SelectHotkeyScope';
import { Dropdown } from '@/ui/layout/dropdown/components/Dropdown';
import { DropdownMenuItemsContainer } from '@/ui/layout/dropdown/components/DropdownMenuItemsContainer';
import { useDropdown } from '@/ui/layout/dropdown/hooks/useDropdown';

export type SelectOption = {
  value: boolean;
  label: string;
  Icon?: IconComponent;
};

export type SettingsSelectStatusPillProps = {
  className?: string;
  disabled?: boolean;
  dropdownId: string;
  dropdownWidth?: `${string}px` | 'auto' | number;
  onChange?: (value: boolean) => void;
  options: SelectOption[];
  value?: boolean;
};

const StyledContainer = styled.div<{ fullWidth?: boolean }>`
  margin-right: ${({ theme }) => theme.spacing(2)};
  width: ${({ fullWidth }) => (fullWidth ? '100%' : 'auto')};
`;

const StyledControlContainer = styled.div<{
  disabled?: boolean;
  selectedValue?: boolean;
}>`
  align-items: center;
  background-color: ${({ selectedValue }) => {
    switch (selectedValue) {
      case false:
        return '#ddfcd8';
      case true:
        return '#FED8D8';
      default:
        return '#d6d6d6';
    }
  }};
  border: 1px solid ${({ theme }) => theme.border.color.medium};
  border-radius: ${({ theme }) => theme.border.radius.pill};
  color: ${({ selectedValue }) => {
    switch (selectedValue) {
      case false:
        return '#2A5822';
      case true:
        return '#712727';
      default:
        return '#000000';
    }
  }};
  cursor: ${({ disabled }) => (disabled ? 'not-allowed' : 'pointer')};
  display: flex;
  justify-content: space-between;
  padding: ${({ theme }) => theme.spacing(1)} ${({ theme }) => theme.spacing(2)};
`;

const StyledControlLabel = styled.div`
  align-items: center;
  display: flex;
  gap: ${({ theme }) => theme.spacing(1)};
`;

export const SettingsSelectStatusPill = ({
  className,
  disabled: disabledFromProps,
  dropdownId,
  dropdownWidth = 176,
  onChange,
  options,
  value,
}: SettingsSelectStatusPillProps) => {
  const selectContainerRef = useRef<HTMLDivElement>(null);
  const theme = useTheme();
  const selectedOption =
    options.find(({ value: key }) => key === value) || options[0];

  const isDisabled = disabledFromProps || options.length <= 1;
  const { closeDropdown } = useDropdown(dropdownId);

  const selectControl = (
    <StyledControlContainer
      disabled={isDisabled}
      selectedValue={selectedOption?.value}
    >
      <StyledControlLabel>
        {!!selectedOption?.Icon && (
          <selectedOption.Icon
            size={theme.icon.size.sm}
            stroke={theme.icon.stroke.sm}
          />
        )}
        {selectedOption?.label}
      </StyledControlLabel>
    </StyledControlContainer>
  );

  return (
    <StyledContainer
      className={className}
      tabIndex={0}
      ref={selectContainerRef}
    >
      {isDisabled ? (
        selectControl
      ) : (
        <Dropdown
          dropdownId={dropdownId}
          dropdownMenuWidth={dropdownWidth}
          dropdownPlacement="bottom-start"
          clickableComponent={selectControl}
          dropdownComponents={
            <DropdownMenuItemsContainer hasMaxHeight>
              {options.map((option) => (
                <SelectStatusPillItem
                  key={option.label}
                  text={option.label}
                  backgroundColor={
                    option.value === false ? '#ddfcd8' : '#FED8D8'
                  }
                  LeftIcon={option.Icon}
                  isSelected={option.value === value}
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
      )}
    </StyledContainer>
  );
};
