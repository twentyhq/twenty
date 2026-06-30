import { sanitizeAndValidateInput } from '@/object-record/record-field/ui/meta-types/input/utils/sanitizeAndValidateInput';

describe('sanitizeAndValidateInput', () => {
  it('should trim whitespace from input', () => {
    expect(sanitizeAndValidateInput('  hello  ').sanitizedInput).toBe('hello');
    expect(sanitizeAndValidateInput('   ').sanitizedInput).toBe('');
  });

  it('should be valid when no validator is provided', () => {
    const result = sanitizeAndValidateInput('anything');

    expect(result.isValid).toBe(true);
    expect(result.errorMessage).toBe('');
  });

  it('should skip validation for empty input', () => {
    const validateInput = jest.fn(() => ({
      isValid: false,
      errorMessage: 'fail',
    }));

    const result = sanitizeAndValidateInput('', validateInput);

    expect(validateInput).not.toHaveBeenCalled();
    expect(result.isValid).toBe(true);
  });

  it('should validate the trimmed input and propagate the result', () => {
    const validateInput = jest.fn(() => ({
      isValid: false,
      errorMessage: 'Invalid format',
    }));

    const result = sanitizeAndValidateInput('  bad  ', validateInput);

    expect(validateInput).toHaveBeenCalledWith('bad');
    expect(result.isValid).toBe(false);
    expect(result.errorMessage).toBe('Invalid format');
  });
});
