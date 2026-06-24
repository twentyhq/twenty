import { Select } from '@/ui/input/components/Select';
import { SelectControl } from '@/ui/input/components/SelectControl';
import { TextArea } from '@/ui/input/components/TextArea';
import { TextInput } from '@/ui/input/components/TextInput';
import { Dropdown } from '@/ui/layout/dropdown/components/Dropdown';
import { DropdownContent } from '@/ui/layout/dropdown/components/DropdownContent';
import { DropdownMenuItemsContainer } from '@/ui/layout/dropdown/components/DropdownMenuItemsContainer';
import { styled } from '@linaria/react';
import { t } from '@lingui/core/macro';
import {
  type ApplicationVariableOption,
  deserializeApplicationVariableValue,
  serializeApplicationVariableValue,
} from 'twenty-shared/application';
import { FieldMetadataType } from 'twenty-shared/types';
import { CodeEditor } from 'twenty-ui/input';
import { MenuItemMultiSelect } from 'twenty-ui/navigation';

const StyledCodeEditorContainer = styled.div`
  display: flex;
  flex-direction: column;
  width: 100%;
`;

const BOOLEAN_OPTIONS = [
  { value: 'true', label: 'true' },
  { value: 'false', label: 'false' },
];

type SettingsApplicationVariableInputProps = {
  // FieldMetadataType string (defaults to TEXT). Stored value is always a
  // serialized string; this drives which input is rendered.
  type?: string | null;
  // Serialized string value as persisted on the variable.
  value: string;
  options?: ApplicationVariableOption[] | null;
  onChange: (serializedValue: string) => void;
  placeholder?: string;
  disabled?: boolean;
};

export const SettingsApplicationVariableInput = ({
  type,
  value,
  options,
  onChange,
  placeholder,
  disabled,
}: SettingsApplicationVariableInputProps) => {
  const fieldType = (type as FieldMetadataType) ?? FieldMetadataType.TEXT;

  const selectOptions = (options ?? []).map((option) => ({
    value: option.value,
    label: option.label,
  }));

  const handleTypedChange = (typedValue: unknown) => {
    onChange(serializeApplicationVariableValue(typedValue as never, fieldType));
  };

  switch (fieldType) {
    case FieldMetadataType.BOOLEAN:
      return (
        <Select
          value={value === 'true' ? 'true' : 'false'}
          onChange={(newValue) => handleTypedChange(newValue === 'true')}
          disabled={disabled}
          options={BOOLEAN_OPTIONS}
          dropdownId="application-variable-boolean-select"
          fullWidth
        />
      );

    case FieldMetadataType.SELECT:
      return (
        <Select
          value={value}
          onChange={(newValue) => onChange(String(newValue))}
          disabled={disabled}
          options={selectOptions}
          dropdownId="application-variable-select"
          fullWidth
        />
      );

    case FieldMetadataType.MULTI_SELECT: {
      const selectedValues = deserializeApplicationVariableValue(
        value,
        fieldType,
      ) as string[];
      const isValueSelected = (optionValue: string) =>
        selectedValues.includes(optionValue);
      const toggleValue = (optionValue: string) => {
        const newValues = isValueSelected(optionValue)
          ? selectedValues.filter((selected) => selected !== optionValue)
          : [...selectedValues, optionValue];
        handleTypedChange(newValues);
      };

      return (
        <Dropdown
          dropdownId="application-variable-multi-select-dropdown"
          dropdownPlacement="bottom-start"
          dropdownOffset={{ y: 8 }}
          clickableComponent={
            <SelectControl
              selectedOption={{
                value: '',
                label:
                  selectedValues.length > 0
                    ? selectedValues.join(', ')
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
                    className="application-variable-multi-select-item"
                    onSelectChange={() => toggleValue(option.value)}
                  />
                ))}
              </DropdownMenuItemsContainer>
            </DropdownContent>
          }
        />
      );
    }

    case FieldMetadataType.NUMBER:
    case FieldMetadataType.NUMERIC:
      return (
        <TextInput
          value={value}
          onChange={(text) => onChange(text)}
          disabled={disabled}
          placeholder={placeholder ?? t`Value`}
          type="number"
          fullWidth
        />
      );

    case FieldMetadataType.DATE:
      return (
        <TextInput
          value={value}
          onChange={(text) => onChange(text)}
          disabled={disabled}
          type="date"
          fullWidth
        />
      );

    case FieldMetadataType.DATE_TIME:
      return (
        <TextInput
          value={value}
          onChange={(text) => onChange(text)}
          disabled={disabled}
          type="datetime-local"
          fullWidth
        />
      );

    case FieldMetadataType.ARRAY:
      return (
        <TextArea
          value={value}
          onChange={(text) => onChange(text)}
          disabled={disabled}
          placeholder={placeholder ?? t`Enter a JSON array`}
          maxRows={5}
        />
      );

    case FieldMetadataType.RAW_JSON:
      return (
        <StyledCodeEditorContainer>
          <CodeEditor
            value={value}
            language="json"
            height="200px"
            options={{ readOnly: disabled === true }}
            onChange={(text) => onChange(text)}
          />
        </StyledCodeEditorContainer>
      );

    case FieldMetadataType.RICH_TEXT:
      return (
        <TextArea
          value={value}
          onChange={(text) => onChange(text)}
          disabled={disabled}
          placeholder={placeholder ?? t`Value`}
          maxRows={5}
        />
      );

    default:
      return (
        <TextInput
          value={value}
          onChange={(text) => onChange(text)}
          disabled={disabled}
          placeholder={placeholder ?? t`Value`}
          fullWidth
        />
      );
  }
};
