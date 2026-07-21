import { type ElementGeometrySnapshot } from '@/types/ElementGeometrySnapshot';
import { isElementGeometryEqualWithinEpsilon } from '../isElementGeometryEqualWithinEpsilon';

const createSnapshot = (
  overrides: Partial<ElementGeometrySnapshot> = {},
): ElementGeometrySnapshot => ({
  x: 0,
  y: 0,
  width: 0,
  height: 0,
  offsetWidth: 0,
  offsetHeight: 0,
  offsetTop: 0,
  offsetLeft: 0,
  clientWidth: 0,
  clientHeight: 0,
  clientTop: 0,
  clientLeft: 0,
  scrollWidth: 0,
  scrollHeight: 0,
  scrollTop: 0,
  scrollLeft: 0,
  ...overrides,
});

describe('isElementGeometryEqualWithinEpsilon', () => {
  it('should treat an undefined previous snapshot as different', () => {
    expect(
      isElementGeometryEqualWithinEpsilon(undefined, createSnapshot()),
    ).toBe(false);
  });

  it('should treat a sub-epsilon difference as equal', () => {
    expect(
      isElementGeometryEqualWithinEpsilon(
        createSnapshot({ width: 10 }),
        createSnapshot({ width: 10.01 }),
      ),
    ).toBe(true);
  });

  it('should treat a supra-epsilon difference as different', () => {
    expect(
      isElementGeometryEqualWithinEpsilon(
        createSnapshot({ width: 10 }),
        createSnapshot({ width: 10.5 }),
      ),
    ).toBe(false);
  });

  it('should compare every field', () => {
    expect(
      isElementGeometryEqualWithinEpsilon(
        createSnapshot(),
        createSnapshot({ scrollLeft: 5 }),
      ),
    ).toBe(false);
  });
});
