import styled from '@emotion/styled';
import { useMemo } from 'react';

import { Select } from '@/ui/input/components/Select';
import { TextArea } from '@/ui/input/components/TextArea';
import { TextInput } from '@/ui/input/components/TextInput';

const StyledContainer = styled.div`
  width: 100%;
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
    if (type !== 'array' || !value) return '';

    try {
      // Pretty print JSON for better readability
      const parsed = JSON.parse(value);
      return JSON.stringify(parsed, null, 2);
    } catch {
      return value;
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
      { value: 'true', label: 'True' },
      { value: 'false', label: 'False' },
    ],
    [],
  );

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
        <TextArea
          value={arrayValue}
          onChange={(text) => {
            try {
              // Validate JSON format when changing
              JSON.parse(text);
              onChange(text);
            } catch {
              // If not valid JSON, still update the visible text for editing
              onChange(text);
            }
          }}
          disabled={disabled}
          placeholder={placeholder || 'Enter JSON array'}
          minRows={3}
        />
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
