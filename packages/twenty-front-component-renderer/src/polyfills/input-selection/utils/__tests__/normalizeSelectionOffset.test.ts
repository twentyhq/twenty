import { normalizeSelectionOffset } from '../normalizeSelectionOffset';

describe('normalizeSelectionOffset', () => {
  it.each([
    [3, 3],
    ['3', 3],
    [2.9, 2],
    [null, 0],
    [undefined, 0],
    [Number.NaN, 0],
    [-1, 4294967295],
  ])(
    'should convert %p to %p like an unsigned long',
    (offset, expectedOffset) => {
      expect(normalizeSelectionOffset(offset)).toBe(expectedOffset);
    },
  );

  it('should reject a BigInt like the DOM does', () => {
    expect(() => normalizeSelectionOffset(BigInt(1))).toThrow(TypeError);
  });
});
