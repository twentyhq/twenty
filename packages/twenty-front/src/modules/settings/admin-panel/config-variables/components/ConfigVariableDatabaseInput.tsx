import { Select } from '@/ui/input/components/Select';
import { SelectControl } from '@/ui/input/components/SelectControl';
import { TextArea } from '@/ui/input/components/TextArea';
import { TextInput } from '@/ui/input/components/TextInput';
import { Dropdown } from '@/ui/layout/dropdown/components/Dropdown';
import { DropdownContent } from '@/ui/layout/dropdown/components/DropdownContent';
import { DropdownMenuItemsContainer } from '@/ui/layout/dropdown/components/DropdownMenuItemsContainer';
import { styled } from '@linaria/react';
import { t } from '@lingui/core/macro';
import { type ConfigVariableValue } from 'twenty-shared/types';
import { CustomError } from 'twenty-shared/utils';
import { CodeEditor } from 'twenty-ui/input';
import { MenuItemMultiSelect } from 'twenty-ui/navigation';
import { themeCssVariables } from 'twenty-ui/theme-constants';
import { ConfigVariableType } from '~/generated-admin/graphql';
import { type ConfigVariableOptions } from '@/settings/admin-panel/config-variables/types/ConfigVariableOptions';

const StyledJsonEditorContainer = styled.div`
  display: flex;
  flex-direction: column;
  width: 100%;
`;

const StyledJsonEditorLabel = styled.span`
  color: ${themeCssVariables.font.color.light};
  display: block;
  font-size: ${themeCssVariables.font.size.xs};
  font-weight: ${themeCssVariables.font.weight.semiBold};
  margin-bottom: ${themeCssVariables.spacing[1]};
`;

type ConfigVariableDatabaseInputProps = {
  label: string;
  value: ConfigVariableValue;
  onChange: (value: ConfigVariableValue) => void;
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
                        : t`Select options`,
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
              placeholder={placeholder || t`Enter JSON array`}
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
          placeholder={placeholder || t`Enter value`}
          fullWidth
        />
      );

    case ConfigVariableType.JSON:
      return (
        <StyledJsonEditorContainer>
          <StyledJsonEditorLabel>{label}</StyledJsonEditorLabel>
          <CodeEditor
            value={
              typeof value === 'string'
                ? value
                : value !== null && value !== undefined
                  ? JSON.stringify(value, null, 2)
                  : ''
            }
            language="json"
            height="200px"
            options={{
              readOnly: disabled === true,
            }}
            onChange={(text) => {
              try {
                onChange(JSON.parse(text) as Record<string, unknown>);
              } catch {
                onChange(text as unknown as ConfigVariableValue);
              }
            }}
          />
        </StyledJsonEditorContainer>
      );

    default:
      throw new CustomError(`Unsupported type: ${type}`, 'UNSUPPORTED_TYPE');
  }
};
