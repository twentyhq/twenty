import { hashColorKey } from '@/page-layout/widgets/graph/utils/hashColorKey';

describe('hashColorKey', () => {
  it('should return the same hash for the same key', () => {
    expect(hashColorKey('Microsoft')).toBe(hashColorKey('Microsoft'));
  });

  it('should return a non-negative integer', () => {
    expect(hashColorKey('won')).toBeGreaterThanOrEqual(0);
    expect(Number.isInteger(hashColorKey('won'))).toBe(true);
  });

  it('should match the stringToThemeColor hash for known values', () => {
    expect(hashColorKey('won')).toBe(117910);
    expect(hashColorKey('lost')).toBe(3327780);
  });
});
