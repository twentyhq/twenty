import { isSystemSearchVectorField } from '@/object-record/utils/isSystemSearchVectorField';

describe('isSystemSearchVectorField', () => {
  it('should return true for searchVector field', () => {
    expect(isSystemSearchVectorField('searchVector')).toBe(true);
  });

  it('should return false for other field names', () => {
    expect(isSystemSearchVectorField('name')).toBe(false);
    expect(isSystemSearchVectorField('id')).toBe(false);
    expect(isSystemSearchVectorField('position')).toBe(false);
    expect(isSystemSearchVectorField('')).toBe(false);
  });
});
