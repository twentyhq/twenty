import { isApiKeyNotConfiguredError } from '@/ai/utils/isApiKeyNotConfiguredError';

describe('isApiKeyNotConfiguredError', () => {
  it('should return true for API key not configured error', () => {
    const error = new Error('API key not set') as Error & { code: string };
    error.code = 'API_KEY_NOT_CONFIGURED';

    expect(isApiKeyNotConfiguredError(error)).toBe(true);
  });

  it('should return false for billing credits exhausted error', () => {
    const error = new Error('Credits exhausted') as Error & { code: string };
    error.code = 'BILLING_CREDITS_EXHAUSTED';

    expect(isApiKeyNotConfiguredError(error)).toBe(false);
  });

  it('should return false for generic error', () => {
    const error = new Error('Something went wrong');

    expect(isApiKeyNotConfiguredError(error)).toBe(false);
  });

  it('should return false for null', () => {
    expect(isApiKeyNotConfiguredError(null)).toBe(false);
  });

  it('should return false for undefined', () => {
    expect(isApiKeyNotConfiguredError(undefined)).toBe(false);
  });
});
