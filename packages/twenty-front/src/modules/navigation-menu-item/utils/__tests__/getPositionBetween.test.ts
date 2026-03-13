import { getPositionBetween } from '@/navigation-menu-item/utils/getPositionBetween';

describe('getPositionBetween', () => {
  it('returns next - 1 when only next is defined (insert before)', () => {
    expect(getPositionBetween(null, 10)).toBe(9);
    expect(getPositionBetween(undefined, 1)).toBe(0);
  });

  it('returns prev + 1 when only prev is defined (insert after)', () => {
    expect(getPositionBetween(5, null)).toBe(6);
    expect(getPositionBetween(0, undefined)).toBe(1);
  });

  it('returns midpoint when both are defined and different', () => {
    expect(getPositionBetween(0, 10)).toBe(5);
    expect(getPositionBetween(1, 3)).toBe(2);
  });

  it('returns prev - 1 when both defined and equal', () => {
    expect(getPositionBetween(5, 5)).toBe(4);
  });

  it('returns 0 when both are null or undefined', () => {
    expect(getPositionBetween(null, null)).toBe(0);
    expect(getPositionBetween(undefined, undefined)).toBe(0);
  });
});
