import { type HttpRequestBody } from '@/workflow/workflow-steps/workflow-actions/http-request-action/constants/HttpRequest';
import { hasNonStringValues } from '@/workflow/workflow-steps/workflow-actions/http-request-action/utils/hasNonStringValues';
import { removeVariablesFromJson } from '@/workflow/workflow-variables/utils/removeVariablesFromJson';
import { isObject, isString, isUndefined } from '@sniptt/guards';
import { parseJson } from 'twenty-shared/utils';
import { type JsonValue } from 'type-fest';

export const shouldDisplayRawJsonByDefault = (
  defaultValue: string | HttpRequestBody | undefined,
) => {
  const defaultValueParsedWithoutVariables: JsonValue | undefined = isString(
    defaultValue,
  )
    ? (parseJson<JsonValue>(removeVariablesFromJson(defaultValue)) ?? {})
    : defaultValue;

  if (isUndefined(defaultValueParsedWithoutVariables)) {
    return false;
  }

  return (
    ((isObject(defaultValueParsedWithoutVariables) ||
      Array.isArray(defaultValueParsedWithoutVariables)) &&
      hasNonStringValues(defaultValueParsedWithoutVariables)) ||
    !(
      isObject(defaultValueParsedWithoutVariables) ||
      Array.isArray(defaultValueParsedWithoutVariables)
    )
  );
};
