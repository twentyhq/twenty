import { AIChatErrorCode } from '@/ai/utils/AIChatErrorCode';
import { isAIChatErrorOfType } from '@/ai/utils/isAIChatErrorOfType';

describe('isAIChatErrorOfType', () => {
  describe('matching error codes', () => {
    it('should return true when error code matches BILLING_CREDITS_EXHAUSTED', () => {
      const error = new Error('test') as Error & { code: string };
      error.code = 'BILLING_CREDITS_EXHAUSTED';

      expect(
        isAIChatErrorOfType(error, AIChatErrorCode.BILLING_CREDITS_EXHAUSTED),
      ).toBe(true);
    });

    it('should return true when error code matches API_KEY_NOT_CONFIGURED', () => {
      const error = new Error('test') as Error & { code: string };
      error.code = 'API_KEY_NOT_CONFIGURED';

      expect(
        isAIChatErrorOfType(error, AIChatErrorCode.API_KEY_NOT_CONFIGURED),
      ).toBe(true);
    });
  });

  describe('non-matching error codes', () => {
    it('should return false when error code does not match', () => {
      const error = new Error('test') as Error & { code: string };
      error.code = 'SOME_OTHER_ERROR';

      expect(
        isAIChatErrorOfType(error, AIChatErrorCode.BILLING_CREDITS_EXHAUSTED),
      ).toBe(false);
    });

    it('should return false when error has no code', () => {
      const error = new Error('test');

      expect(
        isAIChatErrorOfType(error, AIChatErrorCode.BILLING_CREDITS_EXHAUSTED),
      ).toBe(false);
    });
  });

  describe('null and undefined handling', () => {
    it('should return false for null error', () => {
      expect(
        isAIChatErrorOfType(null, AIChatErrorCode.BILLING_CREDITS_EXHAUSTED),
      ).toBe(false);
    });

    it('should return false for undefined error', () => {
      expect(
        isAIChatErrorOfType(
          undefined,
          AIChatErrorCode.BILLING_CREDITS_EXHAUSTED,
        ),
      ).toBe(false);
    });
  });
});
