import { AISDKError, APICallError, RetryError, StreamProviderError } from 'ai';
import { isDefined } from 'twenty-shared/utils';

export const getAiSdkErrorFingerprint = (error: AISDKError): string[] => {
  const failure =
    RetryError.isInstance(error) && AISDKError.isInstance(error.lastError)
      ? error.lastError
      : error;

  const statusCode =
    APICallError.isInstance(failure) || StreamProviderError.isInstance(failure)
      ? failure.statusCode
      : undefined;

  return [
    'ai-sdk-error',
    failure.name,
    isDefined(statusCode) ? String(statusCode) : 'no-status',
  ];
};
