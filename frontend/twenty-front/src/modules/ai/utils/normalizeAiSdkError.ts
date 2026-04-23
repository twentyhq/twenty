import { isDefined } from 'twenty-shared/utils';

// The Vercel AI SDK wraps non-200 responses into an Error whose message
// is the raw JSON response body, losing any custom properties (like `code`).
// This function parses that JSON and re-attaches the code so downstream
// consumers (extractErrorCode) can find it without knowing about the SDK.
export const normalizeAiSdkError = (
  error: Error | undefined,
): Error | undefined => {
  if (!isDefined(error) || !(error instanceof Error)) {
    return error;
  }

  if (
    'code' in error &&
    typeof (error as Error & { code: string }).code === 'string'
  ) {
    return error;
  }

  try {
    const parsed: unknown = JSON.parse(error.message);

    if (
      isDefined(parsed) &&
      typeof parsed === 'object' &&
      'code' in parsed &&
      typeof (parsed as { code: unknown }).code === 'string'
    ) {
      const normalizedError = new Error(error.message) as Error & {
        code: string;
      };
      normalizedError.code = (parsed as { code: string }).code;
      normalizedError.stack = error.stack;

      return normalizedError;
    }
  } catch {
    // message is not JSON — nothing to normalize
  }

  return error;
};
