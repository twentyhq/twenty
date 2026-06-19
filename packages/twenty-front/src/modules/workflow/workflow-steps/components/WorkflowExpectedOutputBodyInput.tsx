import { FormRawJsonFieldInput } from '@/object-record/record-field/ui/form-types/components/FormRawJsonFieldInput';
import { parseAndValidateVariableFriendlyStringifiedJson } from '@/workflow/utils/parseAndValidateVariableFriendlyStringifiedJson';
import { t } from '@lingui/core/macro';
import { isNonEmptyString } from '@sniptt/guards';
import { useState } from 'react';
import { isDefined } from 'twenty-shared/utils';

type WorkflowExpectedOutputBodyInputProps = {
  label?: string;
  placeholder?: string;
  defaultValue: object | undefined;
  readonly?: boolean;
  onChange: (parsedValue: Record<string, unknown>) => void;
};

export const WorkflowExpectedOutputBodyInput = ({
  label,
  placeholder,
  defaultValue,
  readonly,
  onChange,
}: WorkflowExpectedOutputBodyInputProps) => {
  const [error, setError] = useState<string | undefined>();
  const [errorVisible, setErrorVisible] = useState(false);

  const handleChange = (value: string | null) => {
    if (readonly === true) {
      return;
    }

    const parsingResult = parseAndValidateVariableFriendlyStringifiedJson(
      isNonEmptyString(value) ? value : '{}',
    );

    if (!parsingResult.isValid) {
      setError(parsingResult.error);

      return;
    }

    setError(undefined);
    onChange(parsingResult.data);
  };

  return (
    <FormRawJsonFieldInput
      label={label ?? t`Expected Output Body`}
      placeholder={placeholder ?? t`Enter a JSON object`}
      error={errorVisible ? error : undefined}
      onBlur={() => setErrorVisible(true)}
      readonly={readonly}
      defaultValue={
        isDefined(defaultValue) && Object.keys(defaultValue).length > 0
          ? JSON.stringify(defaultValue, null, 2)
          : null
      }
      onChange={handleChange}
    />
  );
};
