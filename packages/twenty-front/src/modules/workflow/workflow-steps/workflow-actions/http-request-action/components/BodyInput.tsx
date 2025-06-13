import { FormFieldInputContainer } from '@/object-record/record-field/form-types/components/FormFieldInputContainer';
import { FormRawJsonFieldInput } from '@/object-record/record-field/form-types/components/FormRawJsonFieldInput';

import { InputLabel } from '@/ui/input/components/InputLabel';
import { Select } from '@/ui/input/components/Select';
import {
  DEFAULT_JSON_BODY_PLACEHOLDER,
  HttpRequestBody,
} from '@/workflow/workflow-steps/workflow-actions/http-request-action/constants/HttpRequest';
import { hasNonStringValues } from '@/workflow/workflow-steps/workflow-actions/http-request-action/utils/hasNonStringValues';
import { WorkflowVariablePicker } from '@/workflow/workflow-variables/components/WorkflowVariablePicker';
import styled from '@emotion/styled';
import { useState } from 'react';
import { IconFileText, IconKey } from 'twenty-ui/display';
import { KeyValuePairInput } from './KeyValuePairInput';

const StyledContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing(2)};
`;

const StyledSelectDropdown = styled(Select)`
  margin-bottom: ${({ theme }) => theme.spacing(2)};
`;

type BodyInputProps = {
  label?: string;
  defaultValue?: HttpRequestBody;
  onChange: (value?: HttpRequestBody) => void;
  readonly?: boolean;
};

export const BodyInput = ({
  defaultValue,
  onChange,
  readonly,
}: BodyInputProps) => {
  const [isRawJson, setIsRawJson] = useState<boolean>(() =>
    hasNonStringValues(defaultValue),
  );
  const [jsonString, setJsonString] = useState<string | null>(
    JSON.stringify(defaultValue, null, 2),
  );
  const [errorMessage, setErrorMessage] = useState<string | undefined>();

  const validateJson = (value: string | null): boolean => {
    if (!value?.trim()) {
      setErrorMessage(undefined);
      return true;
    }

    try {
      JSON.parse(value);
      setErrorMessage(undefined);
      return true;
    } catch (e) {
      setErrorMessage(String(e));
      return false;
    }
  };

  const handleKeyValueChange = (value: Record<string, string>) => {
    onChange(value);
    setErrorMessage(undefined);
  };

  const handleJsonChange = (value: string | null) => {
    setJsonString(value);

    if (!value?.trim()) {
      onChange();
      setErrorMessage(undefined);
      return;
    }

    try {
      const parsed = JSON.parse(value);
      onChange(parsed);
    } catch {
      // Do nothing, validation will happen on blur
    }
  };

  const handleModeChange = (isRawJson: boolean) => {
    setIsRawJson(isRawJson);
    onChange();
    setJsonString(null);
  };

  const handleBlur = () => {
    if (isRawJson && Boolean(jsonString)) {
      validateJson(jsonString);
    }
  };

  return (
    <FormFieldInputContainer>
      <InputLabel>Body Input</InputLabel>
      <StyledSelectDropdown
        options={[
          { label: 'Key/Value', value: 'keyValue', Icon: IconKey },
          { label: 'Raw JSON', value: 'rawJson', Icon: IconFileText },
        ]}
        dropdownId="body-input-mode"
        value={isRawJson ? 'rawJson' : 'keyValue'}
        onChange={(value) => handleModeChange(value === 'rawJson')}
        disabled={readonly}
      />

      <StyledContainer>
        {isRawJson ? (
          <FormRawJsonFieldInput
            placeholder={DEFAULT_JSON_BODY_PLACEHOLDER}
            readonly={readonly}
            defaultValue={jsonString}
            error={errorMessage}
            onBlur={handleBlur}
            onChange={handleJsonChange}
            VariablePicker={WorkflowVariablePicker}
          />
        ) : (
          <KeyValuePairInput
            defaultValue={defaultValue as Record<string, string>}
            onChange={handleKeyValueChange}
            readonly={readonly}
            keyPlaceholder="Property name"
            valuePlaceholder="Property value"
          />
        )}
      </StyledContainer>
    </FormFieldInputContainer>
  );
};
