/* eslint-disable @nx/workspace-no-hardcoded-colors */
import { useTheme } from '@emotion/react';
import styled from '@emotion/styled';
import { useRef } from 'react';
import { IconComponent } from 'twenty-ui/display';

import { MenuSelectStatus } from '@/settings/service-center/components/MenuSelectStatus';
import { SelectHotkeyScope } from '@/ui/input/types/SelectHotkeyScope';
import { Dropdown } from '@/ui/layout/dropdown/components/Dropdown';
import { DropdownMenuItemsContainer } from '@/ui/layout/dropdown/components/DropdownMenuItemsContainer';
import { useDropdown } from '@/ui/layout/dropdown/hooks/useDropdown';

export type SelectOption<Value extends string | number | null> = {
  value: Value;
  label: string;
  Icon?: IconComponent;
};

export type SelectStatusProps<Value extends string | number | null> = {
  className?: string;
  disabled?: boolean;
  dropdownId: string;
  dropdownWidth?: `${string}px` | 'auto' | number;
  onChange?: (value: Value) => void;
  options: SelectOption<Value>[];
  value?: Value;
};

const StyledContainer = styled.div<{ fullWidth?: boolean }>`
  margin-right: ${({ theme }) => theme.spacing(2)};
  width: ${({ fullWidth }) => (fullWidth ? '100%' : 'auto')};
`;

const StyledControlContainer = styled.div<{
  disabled?: boolean;
  selectedValue?: string;
}>`
  align-items: center;
  background-color: ${({ selectedValue }) =>
    selectedValue === 'Active' ? '#ddfcd8' : '#FED8D8'};
  border: 1px solid ${({ theme }) => theme.border.color.medium};
  border-radius: ${({ theme }) => theme.border.radius.pill};
  color: ${({ selectedValue }) =>
    selectedValue === 'Active' ? '#2A5822' : '#712727'};
  cursor: ${({ disabled }) => (disabled ? 'not-allowed' : 'pointer')};
  display: flex;
  justify-content: space-between;
  padding: 5.5px ${({ theme }) => theme.spacing(2)};
`;

const StyledControlLabel = styled.div`
  align-items: center;
  display: flex;
  gap: ${({ theme }) => theme.spacing(1)};
`;

export const SelectStatus = <Value extends string | number | null>({
  className,
  disabled: disabledFromProps,
  dropdownId,
  dropdownWidth = 176,
  onChange,
  options,
  value,
}: SelectStatusProps<Value>) => {
  const selectContainerRef = useRef<HTMLDivElement>(null);
  const theme = useTheme();
  const selectedOption =
    options.find(({ value: key }) => key === value) || options[0];

  const isDisabled = disabledFromProps || options.length <= 1;

  const { closeDropdown } = useDropdown(dropdownId);

  const selectControl = (
    <StyledControlContainer
      disabled={isDisabled}
      selectedValue={selectedOption?.label}
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
          dropdownWidth={dropdownWidth}
          dropdownPlacement="bottom-start"
          clickableComponent={selectControl}
          dropdownComponents={
            <DropdownMenuItemsContainer hasMaxHeight>
              {options.map((option) => (
                <MenuSelectStatus
                  key={option.value}
                  text={option.label}
                  backgroundColor={
                    option.value === 'ACTIVE' ? '#ddfcd8' : '#FED8D8'
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
