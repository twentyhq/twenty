import { t } from '@lingui/core/macro';
import { FormFieldInputContainer } from '@/object-record/record-field/ui/form-types/components/FormFieldInputContainer';
import { FormRawJsonFieldInput } from '@/object-record/record-field/ui/form-types/components/FormRawJsonFieldInput';
import { FormTextFieldInput } from '@/object-record/record-field/ui/form-types/components/FormTextFieldInput';
import { InputLabel } from '@/ui/input/components/InputLabel';
import { Select } from '@/ui/input/components/Select';
import {
  BODY_TYPES,
  DEFAULT_JSON_BODY_PLACEHOLDER,
  type HttpRequestBody,
  type HttpRequestFormData,
} from '@/workflow/workflow-steps/workflow-actions/http-request-action/constants/HttpRequest';
import { getBodyTypeFromHeaders } from '@/workflow/workflow-steps/workflow-actions/http-request-action/utils/getBodyTypeFromHeaders';
import { parseHttpJsonBodyWithoutVariablesOrThrow } from '@/workflow/workflow-steps/workflow-actions/http-request-action/utils/parseHttpJsonBodyWithoutVariablesOrThrow';
import { WorkflowVariablePicker } from '@/workflow/workflow-variables/components/WorkflowVariablePicker';
import styled from '@emotion/styled';
import { isString } from '@sniptt/guards';
import { useState } from 'react';
import { isDefined, parseJson } from 'twenty-shared/utils';
import {
  CONTENT_TYPE_VALUES_HTTP_REQUEST,
  type BodyType,
} from 'twenty-shared/workflow';
import { IconFileText, IconKey } from 'twenty-ui/display';
import { type JsonValue } from 'type-fest';
import { KeyValuePairInput } from './KeyValuePairInput';

const StyledContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing(2)};
`;

const StyledSelectDropdown = styled(Select)`
  margin-bottom: ${({ theme }) => theme.spacing(2)};
`;
const StyledNoBodyMessage = styled.div`
  color: ${({ theme }) => theme.font.color.light};
  font-size: ${({ theme }) => theme.font.size.md};
  padding: ${({ theme }) => theme.spacing(2)};
  text-align: left;
`;

type BodyInputProps = {
  label?: string;
  defaultValue?: HttpRequestBody | string;
  onChange: (
    value?: string | Record<string, string>,
    type?: keyof HttpRequestFormData,
  ) => void;
  readonly?: boolean;
  headers?: Record<string, string>;
};

export const BodyInput = ({
  defaultValue,
  onChange,
  readonly,
  headers,
}: BodyInputProps) => {
  const defaultValueParsed = isString(defaultValue)
    ? (parseJson<JsonValue>(defaultValue) ?? {})
    : defaultValue;

  const isBodyTypeRawJson =
    getBodyTypeFromHeaders(headers) === BODY_TYPES.RAW_JSON;
  const [jsonString, setJsonString] = useState<string | null>(
    isBodyTypeRawJson
      ? isString(defaultValue)
        ? defaultValue
        : JSON.stringify(defaultValue, null, 2)
      : null,
  );
  const [errorMessage, setErrorMessage] = useState<string | undefined>();
  const [textValue, setTextValue] = useState<string | undefined>(
    getBodyTypeFromHeaders(headers) === BODY_TYPES.TEXT &&
      isString(defaultValue)
      ? defaultValue
      : undefined,
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
      parseHttpJsonBodyWithoutVariablesOrThrow(value);

      onChange(value);
    } catch {
      // Do nothing, validation will happen on blur
    }
  };
  const resetBodyStateValue = (bodyTypeValue: BodyType) => {
    if (bodyTypeValue === BODY_TYPES.RAW_JSON && isDefined(jsonString)) {
      setJsonString(null);
      setErrorMessage(undefined);
    } else if (bodyTypeValue === BODY_TYPES.TEXT && isDefined(textValue)) {
      setTextValue(undefined);
    }
  };
  const handleModeChange = (bodyTypeValue: BodyType) => {
    if (
      bodyTypeValue === BODY_TYPES.NONE &&
      isDefined(headers?.['content-type'])
    ) {
      const headersCopy = { ...headers };
      delete headersCopy['content-type'];
      onChange(headersCopy, 'headers');
    } else if (
      bodyTypeValue !== BODY_TYPES.NONE &&
      getBodyTypeFromHeaders(headers) !== bodyTypeValue
    ) {
      const newHeaders = {
        ...headers,
        'content-type': CONTENT_TYPE_VALUES_HTTP_REQUEST[bodyTypeValue],
      };
      resetBodyStateValue(bodyTypeValue);
      onChange(newHeaders, 'headers');
    }
  };

  const handleBlur = () => {
    if (isBodyTypeRawJson) {
      validateJson(jsonString);
    }
  };

  return (
    <FormFieldInputContainer>
      <InputLabel>{t`Body Input`}</InputLabel>
      <StyledSelectDropdown
        options={[
          { label: t`Key/Value`, value: BODY_TYPES.KEY_VALUE, Icon: IconKey },
          {
            label: t`Raw JSON`,
            value: BODY_TYPES.RAW_JSON,
            Icon: IconFileText,
          },
          { label: t`Form Data`, value: BODY_TYPES.FORM_DATA, Icon: IconKey },
          { label: t`Text`, value: BODY_TYPES.TEXT, Icon: IconFileText },
          { label: t`None`, value: BODY_TYPES.NONE, Icon: IconFileText },
        ]}
        dropdownId="body-input-mode"
        value={getBodyTypeFromHeaders(headers) || BODY_TYPES.NONE}
        onChange={(value) => handleModeChange(value as BodyType)}
        disabled={readonly}
      />

      <StyledContainer>
        {isBodyTypeRawJson ? (
          <FormRawJsonFieldInput
            placeholder={DEFAULT_JSON_BODY_PLACEHOLDER}
            readonly={readonly}
            defaultValue={jsonString}
            error={errorMessage}
            onBlur={handleBlur}
            onChange={handleJsonChange}
            VariablePicker={WorkflowVariablePicker}
          />
        ) : getBodyTypeFromHeaders(headers) === BODY_TYPES.KEY_VALUE ? (
          <KeyValuePairInput
            key={'keyValuePair'}
            defaultValue={defaultValueParsed as Record<string, string>}
            onChange={handleKeyValueChange}
            readonly={readonly}
            keyPlaceholder={t`Property name`}
            valuePlaceholder={t`Property value`}
          />
        ) : getBodyTypeFromHeaders(headers) === BODY_TYPES.FORM_DATA ? (
          <KeyValuePairInput
            key={'FormDataPair'}
            defaultValue={defaultValueParsed as Record<string, string>}
            onChange={handleKeyValueChange}
            readonly={readonly}
            keyPlaceholder={t`Property name`}
            valuePlaceholder={t`Property value`}
          />
        ) : getBodyTypeFromHeaders(headers) === BODY_TYPES.TEXT ? (
          <FormTextFieldInput
            placeholder={t`Enter text`}
            readonly={readonly}
            defaultValue={textValue}
            onChange={(value: string) => handleChangeTextValue(value)}
            VariablePicker={WorkflowVariablePicker}
          />
        ) : (
          <StyledNoBodyMessage>{t`No body`}</StyledNoBodyMessage>
        )}
      </StyledContainer>
    </FormFieldInputContainer>
  );
};
