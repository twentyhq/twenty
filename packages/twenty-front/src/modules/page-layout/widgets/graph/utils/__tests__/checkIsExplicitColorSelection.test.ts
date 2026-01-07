import { checkIsExplicitColorSelection } from '@/page-layout/widgets/graph/utils/checkIsExplicitColorSelection';

describe('checkIsExplicitColorSelection', () => {
  it('should return true when all colors are the same', () => {
    expect(checkIsExplicitColorSelection(['green', 'green', 'green'])).toBe(
      true,
    );
  });

  it('should return false when colors differ', () => {
    expect(checkIsExplicitColorSelection(['green', 'blue', 'green'])).toBe(
      false,
    );
  });

  it('should return false when array is empty', () => {
    expect(checkIsExplicitColorSelection([])).toBe(false);
  });

  it('should return false when first color is undefined', () => {
    expect(checkIsExplicitColorSelection([undefined, 'green'])).toBe(false);
  });

  it('should return true for single color', () => {
    expect(checkIsExplicitColorSelection(['blue'])).toBe(true);
  });
});
