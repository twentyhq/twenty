import { extractErrorMessage } from '@/ai/utils/extractErrorMessage';

describe('extractErrorMessage', () => {
  it('should return the string directly when error is a string', () => {
    expect(extractErrorMessage('Something went wrong')).toBe(
      'Something went wrong',
    );
  });

  it('should extract message from object with message property', () => {
    expect(extractErrorMessage({ message: 'Error occurred' })).toBe(
      'Error occurred',
    );
  });

  it('should extract message from nested error object', () => {
    expect(extractErrorMessage({ error: { message: 'Nested error' } })).toBe(
      'Nested error',
    );
  });

  it('should extract message from deeply nested error object', () => {
    expect(
      extractErrorMessage({
        data: { error: { message: 'Deep nested error' } },
      }),
    ).toBe('Deep nested error');
  });

  it('should return fallback message for unknown error shapes', () => {
    const result = extractErrorMessage(42);

    expect(typeof result).toBe('string');
    expect(result.length).toBeGreaterThan(0);
  });

  it('should return fallback message for null', () => {
    const result = extractErrorMessage(null);

    expect(typeof result).toBe('string');
  });
});
