import styled from '@emotion/styled';

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
  value: string | number | boolean | string[] | null;
  onChange: (value: string | number | boolean | string[] | null) => void;
  type?: string;
  options?: any;
  disabled?: boolean;
  placeholder?: string;
};

// can be diff components, if possible refactor
// rename?
export const ConfigVariableInput = ({
  value,
  onChange,
  type,
  options,
  disabled,
  placeholder,
}: ConfigVariableInputProps) => {
  const arrayValue =
    type === 'array' && Array.isArray(value)
      ? (value as string[])
      : type === 'array' && typeof value === 'string' && value
        ? (() => {
            try {
              const arr = JSON.parse(value);
              return Array.isArray(arr) ? arr : [];
            } catch {
              return [];
            }
          })()
        : [];

  const selectOptions =
    options && Array.isArray(options)
      ? options.map((option: any) => ({
          value: String(option),
          label: String(option),
        }))
      : [];

  const booleanOptions = [
    { value: 'true', label: 'true' },
    { value: 'false', label: 'false' },
  ];

  const isValueSelected = (optionValue: string) => {
    if (!arrayValue || !Array.isArray(arrayValue)) return false;
    return arrayValue.includes(optionValue);
  };

  const handleMultiSelectChange = (optionValue: string) => {
    let newValues = [...arrayValue];

    if (isValueSelected(optionValue)) {
      newValues = newValues.filter((val) => val !== optionValue);
    } else {
      newValues.push(optionValue);
    }

    onChange(newValues);
  };

  switch (type) {
    case 'boolean':
      return (
        <StyledContainer>
          <Select
            value={String(value ?? '')}
            onChange={(newValue: string) => onChange(newValue === 'true')}
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
          value={value !== null && value !== undefined ? String(value) : ''}
          onChange={(text) => {
            const num = Number(text);
            onChange(isNaN(num) ? text : num);
          }}
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
                    value={arrayValue.join(', ')}
                    onChange={(text) => {
                      try {
                        const arr = JSON.parse(text);
                        onChange(
                          Array.isArray(arr) ? (arr as string[]) : arrayValue,
                        );
                      } catch {
                        // ignore parse error
                      }
                    }}
                    disabled={true}
                    placeholder={placeholder || 'Enter JSON array'}
                    minRows={3}
                  />
                </StyledDropdownButtonContainer>
              )}
            </>
          ) : (
            <TextArea
              value={
                Array.isArray(value)
                  ? JSON.stringify(value)
                  : String(value ?? '')
              }
              onChange={(text) => {
                try {
                  const arr = JSON.parse(text);
                  onChange(Array.isArray(arr) ? (arr as string[]) : value);
                } catch {
                  onChange(text);
                }
              }}
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
            value={String(value ?? '')}
            onChange={(newValue: string) => onChange(newValue)}
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
          value={
            typeof value === 'string'
              ? value
              : value !== null && value !== undefined
                ? JSON.stringify(value)
                : ''
          }
          onChange={(text) => onChange(text)}
          disabled={disabled}
          placeholder={placeholder || 'Enter value'}
          minRows={3}
        />
      );
  }
};
