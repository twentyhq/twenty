import { FormFieldInputContainer } from '@/object-record/record-field/ui/form-types/components/FormFieldInputContainer';
import { FormRawJsonFieldInput } from '@/object-record/record-field/ui/form-types/components/FormRawJsonFieldInput';
import { FormTextFieldInput } from '@/object-record/record-field/ui/form-types/components/FormTextFieldInput';
import { InputLabel } from '@/ui/input/components/InputLabel';
import { Select } from '@/ui/input/components/Select';
import {
  type BodyType,
  DEFAULT_JSON_BODY_PLACEHOLDER,
  type FormDataFile,
  type HttpRequestBody,
} from '@/workflow/workflow-steps/workflow-actions/http-request-action/constants/HttpRequest';
import { parseHttpJsonBodyWithoutVariablesOrThrow } from '@/workflow/workflow-steps/workflow-actions/http-request-action/utils/parseHttpJsonBodyWithoutVariablesOrThrow';
import { WorkflowVariablePicker } from '@/workflow/workflow-variables/components/WorkflowVariablePicker';
import styled from '@emotion/styled';
import { isString } from '@sniptt/guards';
import { useState } from 'react';
import { parseJson } from 'twenty-shared/utils';
import { IconFileText, IconKey } from 'twenty-ui/display';
import { type JsonValue } from 'type-fest';
import { KeyValuePairInput } from './KeyValuePairInput';
import { MultiPartFormDataInput } from './MultiPartFormDataInput';

const StyledContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing(2)};
`;

const StyledSelectDropdown = styled(Select)`
  margin-bottom: ${({ theme }) => theme.spacing(2)};
`;
const StyledNoBodyMessage = styled.div`
  font-size: 14px;
  padding: ${({ theme }) => theme.spacing(2)};
  text-align: left;
  opacity: 1;
`;

type BodyInputProps = {
  label?: string;
  defaultValue?: HttpRequestBody | string;
  onChange: (value?: string, isBodyType?: boolean) => void;
  readonly?: boolean;
  bodyType?: BodyType;
};

export const BodyInput = ({
  defaultValue,
  onChange,
  readonly,
  bodyType,
}: BodyInputProps) => {
  const defaultValueParsed = isString(defaultValue)
    ? (parseJson<JsonValue>(defaultValue) ?? {})
    : defaultValue;

  const [bodyTypeValue, setBodyTypeValue] = useState<BodyType>(
    bodyType || 'keyValue',
  );
  const [jsonString, setJsonString] = useState<string | null>(
    bodyType === 'rawJson'
      ? isString(defaultValue)
        ? defaultValue
        : JSON.stringify(defaultValue, null, 2)
      : null,
  );
  const [errorMessage, setErrorMessage] = useState<string | undefined>();
  const [textValue, setTextValue] = useState<string | undefined>(
    bodyType === 'Text' && isString(defaultValue) ? defaultValue : undefined,
  );

  const handleChangeTextValue = (text: string) => {
    setTextValue(text);

    onChange(text);
  };
  const validateJson = (value: string | null): boolean => {
    if (!value?.trim()) {
      setErrorMessage(undefined);
      return true;
    }

    try {
      parseHttpJsonBodyWithoutVariablesOrThrow(value);

      setErrorMessage(undefined);
      return true;
    } catch (e) {
      setErrorMessage(String(e));
      return false;
    }
  };

  const handleKeyValueChange = (
    value: Record<string, string | FormDataFile[]>,
  ) => {
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
      parseHttpJsonBodyWithoutVariablesOrThrow(value);

      onChange(value);
    } catch {
      // Do nothing, validation will happen on blur
    }
  };

  const handleModeChange = (bodyType: BodyType) => {
    if (bodyType !== bodyTypeValue) {
      setBodyTypeValue(bodyType);
      onChange(bodyType as BodyType, true);
    }
  };

  const handleBlur = () => {
    if (bodyTypeValue === 'rawJson') {
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
          { label: 'Form Data', value: 'FormData', Icon: IconKey },
          { label: 'Text', value: 'Text', Icon: IconFileText },
          { label: 'None', value: 'None', Icon: IconFileText },
        ]}
        dropdownId="body-input-mode"
        value={bodyTypeValue}
        onChange={(value) => handleModeChange(value as BodyType)}
        disabled={readonly}
      />

      <StyledContainer>
        {bodyTypeValue === 'rawJson' ? (
          <FormRawJsonFieldInput
            placeholder={DEFAULT_JSON_BODY_PLACEHOLDER}
            readonly={readonly}
            defaultValue={jsonString}
            error={errorMessage}
            onBlur={handleBlur}
            onChange={handleJsonChange}
            VariablePicker={WorkflowVariablePicker}
          />
        ) : bodyTypeValue === 'keyValue' ? (
          <KeyValuePairInput
            defaultValue={defaultValueParsed as Record<string, string>}
            onChange={handleKeyValueChange}
            readonly={readonly}
            keyPlaceholder="Property name"
            valuePlaceholder="Property value"
          />
        ) : bodyTypeValue === 'FormData' ? (
          <MultiPartFormDataInput
            defaultValue={
              defaultValueParsed as Record<string, string | Array<FormDataFile>>
            }
            onChange={handleKeyValueChange}
            readonly={readonly}
            keyPlaceholder="Property name"
          />
        ) : bodyTypeValue === 'Text' ? (
          <FormTextFieldInput
            placeholder={'enter text'}
            readonly={readonly}
            defaultValue={textValue}
            onChange={(value: string) => handleChangeTextValue(value)}
            VariablePicker={WorkflowVariablePicker}
          />
        ) : bodyTypeValue === 'None' ? (
          <StyledNoBodyMessage>No body</StyledNoBodyMessage>
        ) : null}
      </StyledContainer>
    </FormFieldInputContainer>
  );
};
