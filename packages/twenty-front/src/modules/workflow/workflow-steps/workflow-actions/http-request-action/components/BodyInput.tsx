import { FormFieldInputContainer } from '@/object-record/record-field/form-types/components/FormFieldInputContainer';
import { FormRawJsonFieldInput } from '@/object-record/record-field/form-types/components/FormRawJsonFieldInput';
import { VariablePickerComponent } from '@/object-record/record-field/form-types/types/VariablePickerComponent';

import { InputLabel } from '@/ui/input/components/InputLabel';
import {
  DEFAULT_BODY_PLACEHOLDER,
  HttpRequestBody,
} from '@/workflow/workflow-steps/workflow-actions/http-request-action/constants/HttpRequest';
import { hasNonStringValues } from '@/workflow/workflow-steps/workflow-actions/http-request-action/utils/hasNonStringValues';
import styled from '@emotion/styled';
import { useState } from 'react';
import { Toggle } from 'twenty-ui/input';
import { KeyValuePairInput } from './KeyValuePairInput';

const StyledContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing(2)};
`;

const StyledModeSelector = styled.div`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing(2)};
`;

const StyledLabelRow = styled(InputLabel)`
  align-items: center;
  display: flex;
  justify-content: space-between;
  width: 100%;
`;

type BodyInputProps = {
  label?: string;
  defaultValue?: HttpRequestBody;
  onChange: (value?: HttpRequestBody) => void;
  readonly?: boolean;
  VariablePicker?: VariablePickerComponent;
  error?: string;
  onBlur?: () => void;
};

export const BodyInput = ({
  defaultValue,
  onChange,
  readonly,
  VariablePicker,
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
      <StyledLabelRow>
        <div>Body</div>
        <StyledModeSelector>
          <div>Raw JSON</div>
          <Toggle
            value={isRawJson}
            onChange={handleModeChange}
            disabled={readonly}
            toggleSize="small"
          />
        </StyledModeSelector>
      </StyledLabelRow>
      <StyledContainer>
        {isRawJson ? (
          <FormRawJsonFieldInput
            placeholder={DEFAULT_BODY_PLACEHOLDER}
            readonly={readonly}
            defaultValue={jsonString}
            error={errorMessage}
            onBlur={handleBlur}
            onChange={handleJsonChange}
            VariablePicker={VariablePicker}
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
