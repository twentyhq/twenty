import styled from '@emotion/styled';
import { useMemo } from 'react';

import { Select } from '@/ui/input/components/Select';
import { SelectControl } from '@/ui/input/components/SelectControl';
import { TextArea } from '@/ui/input/components/TextArea';
import { TextInput } from '@/ui/input/components/TextInput';
import { SelectHotkeyScope } from '@/ui/input/types/SelectHotkeyScope';
import { Dropdown } from '@/ui/layout/dropdown/components/Dropdown';
import { DropdownMenuItemsContainer } from '@/ui/layout/dropdown/components/DropdownMenuItemsContainer';
import { MenuItemMultiSelect } from 'twenty-ui/navigation';

const StyledContainer = styled.div`
  width: 100%;
`;

const StyledArrayContainer = styled.div`
  width: 100%;
`;

const StyledDropdownButtonContainer = styled.div`
  display: flex;
  gap: ${({ theme }) => theme.spacing(1)};
  flex-wrap: wrap;
`;

type ConfigVariableInputProps = {
  value: string;
  onChange: (value: string) => void;
  type?: string;
  options?: any;
  disabled?: boolean;
  placeholder?: string;
};

export const ConfigVariableInput = ({
  value,
  onChange,
  type,
  options,
  disabled,
  placeholder,
}: ConfigVariableInputProps) => {
  // For array type, we need to convert between string and array
  const arrayValue = useMemo(() => {
    if (type !== 'array' || !value) return [];

    try {
      // Parse JSON string to array
      return JSON.parse(value);
    } catch {
      return [];
    }
  }, [type, value]);

  // Create select options from the provided options array
  const selectOptions = useMemo(() => {
    if (!options || !Array.isArray(options)) return [];

    return options.map((option) => ({
      value: String(option),
      label: String(option),
    }));
  }, [options]);

  // Boolean options
  const booleanOptions = useMemo(
    () => [
      { value: 'true', label: 'true' },
      { value: 'false', label: 'false' },
    ],
    [],
  );

  // Check if a value is selected in the multi-select
  const isValueSelected = (optionValue: string) => {
    if (!arrayValue || !Array.isArray(arrayValue)) return false;
    return arrayValue.includes(optionValue);
  };

  // Handle selection change for multi-select
  const handleMultiSelectChange = (optionValue: string) => {
    let newValues = [...arrayValue];

    if (isValueSelected(optionValue)) {
      // Remove if already selected
      newValues = newValues.filter((val) => val !== optionValue);
    } else {
      // Add if not selected
      newValues.push(optionValue);
    }

    // Convert back to JSON string
    onChange(JSON.stringify(newValues));
  };

  switch (type) {
    case 'boolean':
      return (
        <StyledContainer>
          <Select
            value={value}
            onChange={(newValue) => onChange(String(newValue))}
            disabled={disabled}
            options={booleanOptions}
            dropdownId="config-variable-boolean-select"
            fullWidth
          />
        </StyledContainer>
      );

    case 'number':
      return (
        <TextInput
          value={value}
          onChange={(text) => onChange(text)}
          disabled={disabled}
          placeholder={placeholder}
          type="number"
          fullWidth
        />
      );

    case 'array':
      return (
        <StyledArrayContainer>
          {options && Array.isArray(options) ? (
            <>
              <Dropdown
                dropdownId="config-variable-array-dropdown"
                dropdownHotkeyScope={{ scope: SelectHotkeyScope.Select }}
                dropdownPlacement="bottom-start"
                dropdownOffset={{
                  y: 8,
                }}
                clickableComponent={
                  <SelectControl
                    selectedOption={{
                      value: '',
                      label:
                        arrayValue.length > 0
                          ? `${arrayValue.length} selected`
                          : 'Select options',
                    }}
                    isDisabled={disabled}
                    hasRightElement={false}
                    selectSizeVariant="default"
                  />
                }
                dropdownComponents={
                  <DropdownMenuItemsContainer>
                    {selectOptions.map((option) => (
                      <MenuItemMultiSelect
                        key={option.value}
                        text={option.label}
                        selected={isValueSelected(option.value)}
                        className="config-variable-array-menu-item-multi-select"
                        onSelectChange={() =>
                          handleMultiSelectChange(option.value)
                        }
                      />
                    ))}
                  </DropdownMenuItemsContainer>
                }
              />
              {arrayValue.length > 0 && (
                <StyledDropdownButtonContainer>
                  <TextArea
                    value={value}
                    onChange={(text) => onChange(text)}
                    disabled={true}
                    placeholder={placeholder || 'Enter JSON array'}
                    minRows={3}
                  />
                </StyledDropdownButtonContainer>
              )}
            </>
          ) : (
            <TextArea
              value={value}
              onChange={(text) => onChange(text)}
              disabled={disabled}
              placeholder={placeholder || 'Enter JSON array'}
              minRows={3}
            />
          )}
        </StyledArrayContainer>
      );

    case 'enum':
      return (
        <StyledContainer>
          <Select
            value={value}
            onChange={(newValue) => onChange(String(newValue))}
            disabled={disabled}
            options={selectOptions}
            dropdownId="config-variable-enum-select"
            fullWidth
          />
        </StyledContainer>
      );

    default:
      return (
        <TextArea
          value={value}
          onChange={(text) => onChange(text)}
          disabled={disabled}
          placeholder={placeholder || 'Enter value'}
          minRows={3}
        />
      );
  }
};
