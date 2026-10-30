import { GEOMETRY_EPSILON_PIXELS } from '@/host/geometry/constants/GeometryEpsilonPixels';
import { isGeometrySnapshotEqualWithinEpsilon } from '../isGeometrySnapshotEqualWithinEpsilon';

const BASE_SNAPSHOT = { x: 10, y: 20, cursor: 'pointer' };

describe('isGeometrySnapshotEqualWithinEpsilon', () => {
  it('should return false when the previous snapshot is null', () => {
    expect(
      isGeometrySnapshotEqualWithinEpsilon({
        previousSnapshot: null,
        nextSnapshot: BASE_SNAPSHOT,
      }),
    ).toBe(false);
  });

  it('should return false when the previous snapshot is undefined', () => {
    expect(
      isGeometrySnapshotEqualWithinEpsilon({
        previousSnapshot: undefined,
        nextSnapshot: BASE_SNAPSHOT,
      }),
    ).toBe(false);
  });

  it('should return true when the snapshots are equal', () => {
    expect(
      isGeometrySnapshotEqualWithinEpsilon({
        previousSnapshot: BASE_SNAPSHOT,
        nextSnapshot: {
          ...BASE_SNAPSHOT,
        },
      }),
    ).toBe(true);
  });

  it('should return true when a numeric value differs by less than the epsilon', () => {
    expect(
      isGeometrySnapshotEqualWithinEpsilon({
        previousSnapshot: BASE_SNAPSHOT,
        nextSnapshot: {
          ...BASE_SNAPSHOT,
          x: BASE_SNAPSHOT.x + GEOMETRY_EPSILON_PIXELS / 2,
        },
      }),
    ).toBe(true);
  });

  it('should return false when a numeric value differs by more than the epsilon', () => {
    expect(
      isGeometrySnapshotEqualWithinEpsilon({
        previousSnapshot: BASE_SNAPSHOT,
        nextSnapshot: {
          ...BASE_SNAPSHOT,
          y: BASE_SNAPSHOT.y + GEOMETRY_EPSILON_PIXELS * 2,
        },
      }),
    ).toBe(false);
  });

  it('should return false when a non-numeric value changes', () => {
    expect(
      isGeometrySnapshotEqualWithinEpsilon({
        previousSnapshot: BASE_SNAPSHOT,
        nextSnapshot: {
          ...BASE_SNAPSHOT,
          cursor: 'default',
        },
      }),
    ).toBe(false);
  });
  it('compares computed style values independently of snapshot object identity', () => {
    const previousSnapshot = { x: 10, computedStyle: { display: 'flex' } };
    expect(
      isGeometrySnapshotEqualWithinEpsilon({
        previousSnapshot,
        nextSnapshot: { x: 10, computedStyle: { display: 'flex' } },
      }),
    ).toBe(true);
    expect(
      isGeometrySnapshotEqualWithinEpsilon({
        previousSnapshot,
        nextSnapshot: { x: 10, computedStyle: { display: 'none' } },
      }),
    ).toBe(false);
  });
});
