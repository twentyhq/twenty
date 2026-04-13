import { computeInsertPositionFromBounds } from '@/command-menu-item/edit/utils/computeInsertPositionFromBounds';

describe('computeInsertPositionFromBounds', () => {
  it('returns midpoint when both bounds are defined', () => {
    expect(computeInsertPositionFromBounds(2, 4)).toBe(3);
  });

  it('returns midpoint for non-integer result', () => {
    expect(computeInsertPositionFromBounds(1, 2)).toBe(1.5);
  });

  it('returns previous - 1 when only next is undefined', () => {
    expect(computeInsertPositionFromBounds(5, undefined)).toBe(6);
  });

  it('returns next - 1 when only previous is undefined', () => {
    expect(computeInsertPositionFromBounds(undefined, 3)).toBe(2);
  });

  it('returns 0 when both bounds are undefined', () => {
    expect(computeInsertPositionFromBounds(undefined, undefined)).toBe(0);
  });

  it('returns previous - 1 when bounds are equal', () => {
    expect(computeInsertPositionFromBounds(5, 5)).toBe(4);
  });

  it('handles negative positions', () => {
    expect(computeInsertPositionFromBounds(-4, -2)).toBe(-3);
  });

  it('handles zero as previous position', () => {
    expect(computeInsertPositionFromBounds(0, 2)).toBe(1);
  });

  it('handles zero as next position', () => {
    expect(computeInsertPositionFromBounds(-2, 0)).toBe(-1);
  });
});
