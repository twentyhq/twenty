import { isNonEmptyString, isObject } from '@sniptt/guards';
import { APICallError, type AISDKError, StreamProviderError } from 'ai';
import { isDefined } from 'twenty-shared/utils';

export const getAiSdkProviderErrorCode = (
  error: AISDKError,
): string | undefined => {
  if (StreamProviderError.isInstance(error)) {
    return isDefined(error.code) ? String(error.code) : error.type;
  }

  if (!APICallError.isInstance(error) || !isObject(error.data)) {
    return undefined;
  }

  const { data } = error;
  const body = 'error' in data && isObject(data.error) ? data.error : data;

  return ['code', 'type', 'status']
    .map((key) => Reflect.get(body, key))
    .find(isNonEmptyString);
};
