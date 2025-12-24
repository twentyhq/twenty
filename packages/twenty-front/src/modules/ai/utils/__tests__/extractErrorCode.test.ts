import { extractErrorCode } from '@/ai/utils/extractErrorCode';

describe('extractErrorCode', () => {
  describe('direct error code', () => {
    it('should extract code from error with direct code property', () => {
      const error = { code: 'BILLING_CREDITS_EXHAUSTED', message: 'test' };
      expect(extractErrorCode(error)).toBe('BILLING_CREDITS_EXHAUSTED');
    });

    it('should extract code from Error object with code property', () => {
      const error = new Error('test') as Error & { code: string };
      error.code = 'API_KEY_NOT_CONFIGURED';
      expect(extractErrorCode(error)).toBe('API_KEY_NOT_CONFIGURED');
    });
  });

  describe('nested error structure', () => {
    it('should extract code from nested error structure', () => {
      const error = {
        error: { code: 'BILLING_CREDITS_EXHAUSTED' },
      };
      expect(extractErrorCode(error)).toBe('BILLING_CREDITS_EXHAUSTED');
    });

    it('should extract code from deeply nested error structure', () => {
      const error = {
        data: {
          error: { code: 'API_KEY_NOT_CONFIGURED' },
        },
      };
      expect(extractErrorCode(error)).toBe('API_KEY_NOT_CONFIGURED');
    });
  });

  describe('invalid inputs', () => {
    it('should return undefined for null', () => {
      expect(extractErrorCode(null)).toBeUndefined();
    });

    it('should return undefined for undefined', () => {
      expect(extractErrorCode(undefined)).toBeUndefined();
    });

    it('should return undefined for error without code', () => {
      const error = { message: 'test error' };
      expect(extractErrorCode(error)).toBeUndefined();
    });

    it('should return undefined for error with non-string code', () => {
      const error = { code: 123 };
      expect(extractErrorCode(error)).toBeUndefined();
    });

    it('should return undefined for string input', () => {
      expect(extractErrorCode('error string')).toBeUndefined();
    });

    it('should return undefined for number input', () => {
      expect(extractErrorCode(42)).toBeUndefined();
    });

    it('should return undefined for empty object', () => {
      expect(extractErrorCode({})).toBeUndefined();
    });
  });
});
