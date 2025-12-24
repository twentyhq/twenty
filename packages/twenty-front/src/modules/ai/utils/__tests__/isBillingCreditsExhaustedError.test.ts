import { isBillingCreditsExhaustedError } from '@/ai/utils/isBillingCreditsExhaustedError';

describe('isBillingCreditsExhaustedError', () => {
  it('should return true for billing credits exhausted error', () => {
    const error = new Error('Credits exhausted') as Error & { code: string };
    error.code = 'BILLING_CREDITS_EXHAUSTED';

    expect(isBillingCreditsExhaustedError(error)).toBe(true);
  });

  it('should return false for API key not configured error', () => {
    const error = new Error('API key not set') as Error & { code: string };
    error.code = 'API_KEY_NOT_CONFIGURED';

    expect(isBillingCreditsExhaustedError(error)).toBe(false);
  });

  it('should return false for generic error', () => {
    const error = new Error('Something went wrong');

    expect(isBillingCreditsExhaustedError(error)).toBe(false);
  });

  it('should return false for null', () => {
    expect(isBillingCreditsExhaustedError(null)).toBe(false);
  });

  it('should return false for undefined', () => {
    expect(isBillingCreditsExhaustedError(undefined)).toBe(false);
  });
});
