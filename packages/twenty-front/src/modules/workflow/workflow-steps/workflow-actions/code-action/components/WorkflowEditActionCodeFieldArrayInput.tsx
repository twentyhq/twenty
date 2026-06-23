import { FormRawJsonFieldInput } from '@/object-record/record-field/ui/form-types/components/FormRawJsonFieldInput';
import { type VariablePickerComponent } from '@/object-record/record-field/ui/form-types/types/VariablePickerComponent';
import { isStandaloneVariableString } from '@/workflow/utils/isStandaloneVariableString';
import { t } from '@lingui/core/macro';
import { useState } from 'react';
import { isDefined } from 'twenty-shared/utils';

type WorkflowEditActionCodeFieldArrayInputProps = {
  label: string;
  defaultValue: unknown;
  readonly?: boolean;
  onChange: (value: unknown) => void;
  VariablePicker?: VariablePickerComponent;
};

// Renders the current value as the JSON string the user edits. Arrays are
// stringified; a standalone variable (or any legacy raw string) is shown as-is
// so it can be re-parsed on the next edit.
const getStringifiedDefaultValue = (value: unknown): string | null => {
  if (!isDefined(value)) {
    return null;
  }

  if (typeof value === 'string') {
    return value === '' ? null : value;
  }

  if (Array.isArray(value)) {
    return value.length > 0 ? JSON.stringify(value) : null;
  }

  return null;
};

export const WorkflowEditActionCodeFieldArrayInput = ({
  label,
  defaultValue,
  readonly,
  onChange,
  VariablePicker,
}: WorkflowEditActionCodeFieldArrayInputProps) => {
  const [error, setError] = useState<string | undefined>();
  const [errorVisible, setErrorVisible] = useState(false);

  const handleChange = (value: string | null) => {
    if (readonly === true) {
      return;
    }

    if (!isDefined(value) || value.trim() === '') {
      setError(undefined);
      onChange([]);

      return;
    }

    if (isStandaloneVariableString(value)) {
      setError(undefined);
      onChange(value);

      return;
    }

    let parsedValue: unknown;

    try {
      parsedValue = JSON.parse(value);
    } catch {
      setError(t`Enter a valid JSON array, e.g. ["a", "b"]`);

      return;
    }

    if (!Array.isArray(parsedValue)) {
      setError(t`Value must be a JSON array, e.g. ["a", "b"]`);

      return;
    }

    setError(undefined);
    onChange(parsedValue);
  };

  return (
    <FormRawJsonFieldInput
      label={label}
      placeholder={t`Enter a JSON array, e.g. ["a", "b"]`}
      error={errorVisible ? error : undefined}
      onBlur={() => setErrorVisible(true)}
      readonly={readonly}
      defaultValue={getStringifiedDefaultValue(defaultValue)}
      onChange={handleChange}
      VariablePicker={VariablePicker}
    />
  );
};
