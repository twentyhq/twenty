import { FormFieldInputContainer } from '@/object-record/record-field/ui/form-types/components/FormFieldInputContainer';
import { FormRawJsonFieldInput } from '@/object-record/record-field/ui/form-types/components/FormRawJsonFieldInput';
import { FormTextFieldInput } from '@/object-record/record-field/ui/form-types/components/FormTextFieldInput';
import { InputLabel } from '@/ui/input/components/InputLabel';
import { Select } from '@/ui/input/components/Select';
import {
  DEFAULT_JSON_BODY_PLACEHOLDER,
  type HttpRequestBody,
} from '@/workflow/workflow-steps/workflow-actions/http-request-action/constants/HttpRequest';
import {
  type KeyValuePair,
  useKeyValuePairs,
} from '@/workflow/workflow-steps/workflow-actions/http-request-action/hooks/useKeyValuePairs';
import { getBodyTypeFromHeaders } from '@/workflow/workflow-steps/workflow-actions/http-request-action/utils/getBodyTypeFromHeaders';
import { parseHttpJsonBodyWithoutVariablesOrThrow } from '@/workflow/workflow-steps/workflow-actions/http-request-action/utils/parseHttpJsonBodyWithoutVariablesOrThrow';
import { WorkflowVariablePicker } from '@/workflow/workflow-variables/components/WorkflowVariablePicker';
import styled from '@emotion/styled';
import { isString } from '@sniptt/guards';
import { type Dispatch, type SetStateAction, useState } from 'react';
import { isDefined, parseJson } from 'twenty-shared/utils';
import {
  CONTENT_TYPE_VALUES_HTTP_REQUEST,
  type BodyType,
} from 'twenty-shared/workflow';
import { IconFileText, IconKey } from 'twenty-ui/display';
import { type JsonValue } from 'type-fest';
import { v4 } from 'uuid';
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
  font-size: 14px;
  padding: ${({ theme }) => theme.spacing(2)};
  text-align: left;
  opacity: 1;
`;

type BodyInputProps = {
  label?: string;
  defaultValue?: HttpRequestBody | string;
  onChange: (
    value?: string | Record<string, string> | undefined,
    isHeaders?: boolean,
  ) => void;
  readonly?: boolean;
  headers?: Record<string, string>;
  setHeadersPairs?: Dispatch<SetStateAction<KeyValuePair[]>>;
};

export const BodyInput = ({
  defaultValue,
  onChange,
  readonly,
  headers,
  setHeadersPairs,
}: BodyInputProps) => {
  const defaultValueParsed = isString(defaultValue)
    ? (parseJson<JsonValue>(defaultValue) ?? {})
    : defaultValue;
  const { pairs, setPairs } = useKeyValuePairs(
    defaultValueParsed as Record<string, string>,
  );
  const [jsonString, setJsonString] = useState<string | null>(
    getBodyTypeFromHeaders(headers) === 'rawJson'
      ? isString(defaultValue)
        ? defaultValue
        : JSON.stringify(defaultValue, null, 2)
      : null,
  );
  const [errorMessage, setErrorMessage] = useState<string | undefined>();
  const [textValue, setTextValue] = useState<string | undefined>(
    getBodyTypeFromHeaders(headers) === 'Text' && isString(defaultValue)
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

  const handleModeChange = (bodyTypeValue: BodyType) => {
    if (bodyTypeValue === 'None') {
      if (isDefined(headers?.['content-type'])) {
        const headersCopy = { ...headers };
        delete headersCopy['content-type'];
        setHeadersPairs?.((prevValue) =>
          prevValue.filter((value) => value.key !== 'content-type'),
        );
        onChange(headersCopy, true);
      }
    } else {
      setHeadersPairs?.((prevValuePairs) => {
        const pairIndex = prevValuePairs.findIndex(
          (value) => value.key === 'content-type',
        );
        if (pairIndex === -1 || !isDefined(headers?.['content-type'])) {
          return [
            ...prevValuePairs,
            {
              key: 'content-type',
              value: CONTENT_TYPE_VALUES_HTTP_REQUEST[bodyTypeValue],
              id: v4(),
            },
          ];
        } else {
          const newPairs = [...prevValuePairs];

          newPairs[pairIndex] = {
            ...newPairs[pairIndex],
            value: CONTENT_TYPE_VALUES_HTTP_REQUEST[bodyTypeValue],
          };
          return newPairs;
        }
      });
      if (
        (bodyTypeValue === 'FormData' || bodyTypeValue === 'keyValue') &&
        getBodyTypeFromHeaders(headers) !== bodyTypeValue
      ) {
        setPairs([
          {
            key: '',
            value: '',
            id: v4(),
          },
        ]);
      }
      const newHeaders = {
        ...headers,
        'content-type': CONTENT_TYPE_VALUES_HTTP_REQUEST[bodyTypeValue],
      };
      onChange(newHeaders, true);
    }
  };

  const handleBlur = () => {
    if (getBodyTypeFromHeaders(headers) === 'rawJson') {
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
        value={getBodyTypeFromHeaders(headers) || 'None'}
        onChange={(value) => handleModeChange(value as BodyType)}
        disabled={readonly}
      />

      <StyledContainer>
        {getBodyTypeFromHeaders(headers) === 'rawJson' ? (
          <FormRawJsonFieldInput
            placeholder={DEFAULT_JSON_BODY_PLACEHOLDER}
            readonly={readonly}
            defaultValue={jsonString}
            error={errorMessage}
            onBlur={handleBlur}
            onChange={handleJsonChange}
            VariablePicker={WorkflowVariablePicker}
          />
        ) : getBodyTypeFromHeaders(headers) === 'keyValue' ? (
          <KeyValuePairInput
            key={'keyValuePair'}
            defaultValue={defaultValueParsed as Record<string, string>}
            onChange={handleKeyValueChange}
            readonly={readonly}
            keyPlaceholder="Property name"
            valuePlaceholder="Property value"
            pairs={pairs}
            setPairs={setPairs}
          />
        ) : getBodyTypeFromHeaders(headers) === 'FormData' ? (
          <KeyValuePairInput
            key={'FormDataPair'}
            defaultValue={defaultValueParsed as Record<string, string>}
            onChange={handleKeyValueChange}
            readonly={readonly}
            keyPlaceholder="Property name"
            valuePlaceholder="Property value"
            pairs={pairs}
            setPairs={setPairs}
          />
        ) : getBodyTypeFromHeaders(headers) === 'Text' ? (
          <FormTextFieldInput
            placeholder={'enter text'}
            readonly={readonly}
            defaultValue={textValue}
            onChange={(value: string) => handleChangeTextValue(value)}
            VariablePicker={WorkflowVariablePicker}
          />
        ) : (
          <StyledNoBodyMessage>No body</StyledNoBodyMessage>
        )}
      </StyledContainer>
    </FormFieldInputContainer>
  );
};
