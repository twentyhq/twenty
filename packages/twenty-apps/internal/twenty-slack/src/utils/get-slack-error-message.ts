import { ErrorCode, type WebAPIPlatformError } from '@slack/web-api';

const isWebApiPlatformError = (
  error: unknown,
): error is WebAPIPlatformError =>
  error instanceof Error &&
  'code' in error &&
  (error as { code: string }).code === ErrorCode.PlatformError &&
  'data' in error &&
  typeof (error as WebAPIPlatformError).data === 'object' &&
  (error as WebAPIPlatformError).data !== null &&
  typeof (error as WebAPIPlatformError).data.error === 'string';

export const getSlackErrorMessage = (error: unknown): string => {
  if (isWebApiPlatformError(error)) {
    const slackError = error.data.error;

    if (slackError.length > 0) {
      return slackError;
    }
  }

  if (error instanceof Error) {
    return error.message;
  }

  return 'slack_request_failed';
};
