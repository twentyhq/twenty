import { getForeignDataWrapperType } from '@/databases/utils/getForeignDataWrapperType';

describe('getForeignDataWrapperType', () => {
  it('should handle postgres', () => {
    expect(getForeignDataWrapperType('postgresql')).toBe('postgres_fdw');
  });

  it('should handle stripe', () => {
    expect(getForeignDataWrapperType('stripe')).toBe('stripe_fdw');
  });

  it('should return null for unknown', () => {
    expect(getForeignDataWrapperType('unknown')).toBeNull();
  });
});
