import { getOrderByConfigKey } from '@/command-menu/pages/page-layout/utils/getOrderByConfigKey';

describe('getOrderByConfigKey', () => {
  it('should return orderBy for pie axis', () => {
    expect(getOrderByConfigKey('pie')).toBe('orderBy');
  });

  it('should return primaryAxisOrderBy for primary axis', () => {
    expect(getOrderByConfigKey('primary')).toBe('primaryAxisOrderBy');
  });

  it('should return secondaryAxisOrderBy for secondary axis', () => {
    expect(getOrderByConfigKey('secondary')).toBe('secondaryAxisOrderBy');
  });
});
