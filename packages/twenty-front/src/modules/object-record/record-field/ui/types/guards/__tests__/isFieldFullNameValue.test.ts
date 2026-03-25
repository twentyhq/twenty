import { isFieldFullNameValue } from '@/object-record/record-field/ui/types/guards/isFieldFullNameValue';

describe('isFieldFullNameValue', () => {
  it('should return true for valid full name objects', () => {
    expect(isFieldFullNameValue({ firstName: 'John', lastName: 'Doe' })).toBe(
      true,
    );
    expect(isFieldFullNameValue({ firstName: '', lastName: '' })).toBe(true);
  });

  it('should return false for incomplete objects', () => {
    expect(isFieldFullNameValue({ firstName: 'John' })).toBe(false);
    expect(isFieldFullNameValue({ lastName: 'Doe' })).toBe(false);
  });

  it('should return false for non-object values', () => {
    expect(isFieldFullNameValue('John Doe')).toBe(false);
    expect(isFieldFullNameValue(null)).toBe(false);
    expect(isFieldFullNameValue(undefined)).toBe(false);
  });
});
