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
import { CAPTURE_ALL_VARIABLE_TAG_INNER_REGEX } from '@/workflow/workflow-variables/constants/CaptureAllVariableTagInnerRegex';
import styled from '@emotion/styled';
import { isArray, isObject, isString, isUndefined } from '@sniptt/guards';
import { useState } from 'react';
import { parseJson } from 'twenty-shared/utils';
import { IconFileText, IconKey } from 'twenty-ui/display';
import { JsonValue } from 'type-fest';
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
  defaultValue?: HttpRequestBody | string;
  onChange: (value?: string) => void;
  readonly?: boolean;
};

const removeVariablesFromJson = (json: string): string => {
  return json.replaceAll(CAPTURE_ALL_VARIABLE_TAG_INNER_REGEX, 'null');
};

export const BodyInput = ({
  defaultValue,
  onChange,
  readonly,
}: BodyInputProps) => {
  const defaultValueParsed = isString(defaultValue)
    ? (parseJson<JsonValue>(defaultValue) ?? {})
    : defaultValue;

  const [isRawJson, setIsRawJson] = useState<boolean>(() => {
    const defaultValueParsedWithoutVariables: JsonValue | undefined = isString(
      defaultValue,
    )
      ? (parseJson<JsonValue>(removeVariablesFromJson(defaultValue)) ?? {})
      : defaultValue;

    return isUndefined(defaultValueParsedWithoutVariables)
      ? false
      : ((isObject(defaultValueParsedWithoutVariables) ||
          Array.isArray(defaultValueParsedWithoutVariables)) &&
          hasNonStringValues(defaultValueParsedWithoutVariables)) ||
          !(
            isObject(defaultValueParsedWithoutVariables) ||
            isArray(defaultValueParsedWithoutVariables)
          );
  });
  const [jsonString, setJsonString] = useState<string | null>(
    isString(defaultValue)
      ? defaultValue
      : JSON.stringify(defaultValue, null, 2),
  );
  const [errorMessage, setErrorMessage] = useState<string | undefined>();

  const isValidJsonWithVariables = (value: string) => {
    JSON.parse(removeVariablesFromJson(value));
  };

  const validateJson = (value: string | null): boolean => {
    if (!value?.trim()) {
      setErrorMessage(undefined);
      return true;
    }

    try {
      isValidJsonWithVariables(value);

      setErrorMessage(undefined);
      return true;
    } catch (e) {
      setErrorMessage(String(e));
      return false;
    }
  };

  const handleKeyValueChange = (value: Record<string, string>) => {
    onChange(JSON.stringify(value, null, 2));
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
      isValidJsonWithVariables(value);

      onChange(value);
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
            defaultValue={defaultValueParsed as Record<string, string>}
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
