import { CustomError } from '@/error-handler/CustomError';
import { Select } from '@/ui/input/components/Select';
import { SelectControl } from '@/ui/input/components/SelectControl';
import { TextArea } from '@/ui/input/components/TextArea';
import { TextInput } from '@/ui/input/components/TextInput';
import { Dropdown } from '@/ui/layout/dropdown/components/Dropdown';
import { DropdownContent } from '@/ui/layout/dropdown/components/DropdownContent';
import { DropdownMenuItemsContainer } from '@/ui/layout/dropdown/components/DropdownMenuItemsContainer';
import { ConfigVariableValue } from 'twenty-shared/types';
import { MenuItemMultiSelect } from 'twenty-ui/navigation';
import { ConfigVariableType } from '~/generated/graphql';
import { ConfigVariableOptions } from '../types/ConfigVariableOptions';

type ConfigVariableDatabaseInputProps = {
  label: string;
  value: ConfigVariableValue;
  onChange: (value: string | number | boolean | string[] | null) => void;
  type: ConfigVariableType;
  options?: ConfigVariableOptions;
  disabled?: boolean;
  placeholder?: string;
};

export const ConfigVariableDatabaseInput = ({
  label,
  value,
  onChange,
  type,
  options,
  disabled,
  placeholder,
}: ConfigVariableDatabaseInputProps) => {
  const selectOptions =
    options && Array.isArray(options)
      ? options.map((option) => ({
          value: String(option),
          label: String(option),
        }))
      : [];

  const booleanOptions = [
    { value: 'true', label: 'true' },
    { value: 'false', label: 'false' },
  ];

  const isValueSelected = (optionValue: string) => {
    if (!Array.isArray(value)) return false;
    return value.includes(optionValue);
  };

  const handleMultiSelectChange = (optionValue: string) => {
    if (!Array.isArray(value)) return;

    let newValues = [...value];
    if (isValueSelected(optionValue)) {
      newValues = newValues.filter((val) => val !== optionValue);
    } else {
      newValues.push(optionValue);
    }
    onChange(newValues);
  };

  const jsonArrayTextAreaId = `${label}-json-array`;

  switch (type) {
    case ConfigVariableType.BOOLEAN:
      return (
        <Select
          label={label}
          value={String(value ?? '')}
          onChange={(newValue: string) => onChange(newValue === 'true')}
          disabled={disabled}
          options={booleanOptions}
          dropdownId="config-variable-boolean-select"
          fullWidth
        />
      );

    case ConfigVariableType.NUMBER:
      return (
        <TextInput
          label={label}
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

    case ConfigVariableType.ARRAY:
      return (
        <>
          {options && Array.isArray(options) ? (
            <Dropdown
              dropdownId="config-variable-array-dropdown"
              dropdownPlacement="bottom-start"
              dropdownOffset={{
                y: 8,
              }}
              clickableComponent={
                <SelectControl
                  selectedOption={{
                    value: '',
                    label:
                      Array.isArray(value) && value.length > 0
                        ? value.join(', ')
                        : 'Select options',
                  }}
                  isDisabled={disabled}
                  hasRightElement={false}
                  selectSizeVariant="default"
                />
              }
              dropdownComponents={
                <DropdownContent>
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
                </DropdownContent>
              }
            />
          ) : (
            <TextArea
              textAreaId={jsonArrayTextAreaId}
              label={label}
              value={
                Array.isArray(value)
                  ? JSON.stringify(value)
                  : String(value ?? '')
              }
              onChange={(text) => {
                try {
                  const arr = JSON.parse(text);
                  onChange(Array.isArray(arr) ? arr : value);
                } catch {
                  onChange(text);
                }
              }}
              disabled={disabled}
              placeholder={placeholder || 'Enter JSON array'}
            />
          )}
        </>
      );

    case ConfigVariableType.ENUM:
      return (
        <Select
          label={label}
          value={String(value ?? '')}
          onChange={(newValue: string) => onChange(newValue)}
          disabled={disabled}
          options={selectOptions}
          dropdownId="config-variable-enum-select"
          fullWidth
        />
      );

    case ConfigVariableType.STRING:
      return (
        <TextInput
          label={label}
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
          fullWidth
        />
      );

    default:
      throw new CustomError(`Unsupported type: ${type}`, 'UNSUPPORTED_TYPE');
  }
};
