import { normalizeAiSdkError } from '@/ai/utils/normalizeAiSdkError';

describe('normalizeAiSdkError', () => {
  it('should return undefined for undefined input', () => {
    expect(normalizeAiSdkError(undefined)).toBeUndefined();
  });

  it('should return the error unchanged if it already has a code', () => {
    const error = new Error('test') as Error & { code: string };
    error.code = 'EXISTING_CODE';

    const result = normalizeAiSdkError(error);

    expect(result).toBe(error);
    expect((result as Error & { code: string }).code).toBe('EXISTING_CODE');
  });

  it('should parse JSON message and attach code from response body', () => {
    const error = new Error(
      '{"statusCode":402,"error":"Error","messages":["Credits exhausted"],"code":"BILLING_CREDITS_EXHAUSTED"}',
    );

    const result = normalizeAiSdkError(error);

    expect(result).not.toBe(error);
    expect((result as Error & { code: string }).code).toBe(
      'BILLING_CREDITS_EXHAUSTED',
    );
    expect(result?.message).toBe(error.message);
  });

  it('should return original error for non-JSON message', () => {
    const error = new Error('Something went wrong');

    const result = normalizeAiSdkError(error);

    expect(result).toBe(error);
  });

  it('should return original error for JSON message without code', () => {
    const error = new Error(
      '{"statusCode":500,"error":"Internal Server Error"}',
    );

    const result = normalizeAiSdkError(error);

    expect(result).toBe(error);
  });

  it('should preserve the original stack trace', () => {
    const error = new Error(
      '{"statusCode":402,"code":"BILLING_CREDITS_EXHAUSTED"}',
    );
    const originalStack = error.stack;

    const result = normalizeAiSdkError(error);

    expect(result?.stack).toBe(originalStack);
  });
});
