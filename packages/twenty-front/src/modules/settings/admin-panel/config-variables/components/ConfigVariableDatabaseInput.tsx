import { type ConfigVariableOptions } from '@/settings/admin-panel/config-variables/types/ConfigVariableOptions';
import { Select } from '@/ui/input/components/Select';
import { SelectControl } from '@/ui/input/components/SelectControl';
import { TextArea } from '@/ui/input/components/TextArea';
import { TextInput } from '@/ui/input/components/TextInput';
import { DropdownRoot } from '@/ui/layout/dropdown/components/DropdownRoot';
import { ClickOutsideListenerContext } from '@/ui/utilities/pointer-event/contexts/ClickOutsideListenerContext';
import { ParentClickOutsideIdContext } from '@/ui/utilities/pointer-event/contexts/ParentClickOutsideIdContext';
import { styled } from '@linaria/react';
import { t } from '@lingui/core/macro';
import { useContext } from 'react';
import { type ConfigVariableValue } from 'twenty-shared/types';
import { CustomError } from 'twenty-shared/utils';
import { Dropdown } from 'twenty-ui/components';
import { CodeEditor } from 'twenty-ui/components/code-editor';
import { themeCssVariables } from 'twenty-ui/theme-constants';
import { ConfigVariableType } from '~/generated-admin/graphql';

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
  const { excludedClickOutsideId } = useContext(ClickOutsideListenerContext);
  const parentClickOutsideId = useContext(ParentClickOutsideIdContext);

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
            <DropdownRoot
              dropdownId="config-variable-array-dropdown"
              type="picker"
              multiple
            >
              <Dropdown.Trigger
                render={<div />}
                nativeButton={false}
                disabled={disabled}
              >
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
              </Dropdown.Trigger>
              <Dropdown.Content
                side="bottom"
                align="start"
                sideOffset={8}
                data-click-outside-id={excludedClickOutsideId}
              >
                <div data-click-outside-id={parentClickOutsideId}>
                  <Dropdown.Section>
                    {selectOptions.map((option) => (
                      <Dropdown.OptionItem
                        key={option.value}
                        className="config-variable-array-menu-item-multi-select"
                        selected={isValueSelected(option.value)}
                        onSelect={() => handleMultiSelectChange(option.value)}
                      >
                        {option.label}
                      </Dropdown.OptionItem>
                    ))}
                  </Dropdown.Section>
                </div>
              </Dropdown.Content>
            </DropdownRoot>
          ) : (
            <TextArea
              textAreaId={jsonArrayTextAreaId}
              label={label}
              maxRows={5}
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
