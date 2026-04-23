import { isObjectWithId } from '@/object-record/record-field/ui/utils/junction/isObjectWithId';

describe('isObjectWithId', () => {
  it('should return false for undefined', () => {
    expect(isObjectWithId(undefined)).toBe(false);
  });

  it('should return false for null', () => {
    expect(isObjectWithId(null)).toBe(false);
  });

  it('should return false for non-object values', () => {
    expect(isObjectWithId('string')).toBe(false);
    expect(isObjectWithId(123)).toBe(false);
    expect(isObjectWithId(true)).toBe(false);
  });

  it('should return false for object without id property', () => {
    expect(isObjectWithId({ name: 'test' })).toBe(false);
  });

  it('should return false for object with non-string id', () => {
    expect(isObjectWithId({ id: 123 })).toBe(false);
    expect(isObjectWithId({ id: null })).toBe(false);
    expect(isObjectWithId({ id: undefined })).toBe(false);
  });

  it('should return true for object with string id', () => {
    expect(isObjectWithId({ id: 'some-id' })).toBe(true);
    expect(isObjectWithId({ id: 'uuid-123', name: 'test' })).toBe(true);
  });
});
