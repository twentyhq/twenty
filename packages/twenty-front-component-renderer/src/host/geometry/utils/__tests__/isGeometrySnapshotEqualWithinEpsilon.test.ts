import { GEOMETRY_EPSILON_PIXELS } from '@/host/geometry/constants/GeometryEpsilonPixels';
import { isGeometrySnapshotEqualWithinEpsilon } from '../isGeometrySnapshotEqualWithinEpsilon';

const BASE_SNAPSHOT = { x: 10, y: 20, cursor: 'pointer' };

describe('isGeometrySnapshotEqualWithinEpsilon', () => {
  it('should return false when the previous snapshot is null', () => {
    expect(isGeometrySnapshotEqualWithinEpsilon(null, BASE_SNAPSHOT)).toBe(
      false,
    );
  });

  it('should return false when the previous snapshot is undefined', () => {
    expect(isGeometrySnapshotEqualWithinEpsilon(undefined, BASE_SNAPSHOT)).toBe(
      false,
    );
  });

  it('should return true when the snapshots are equal', () => {
    expect(
      isGeometrySnapshotEqualWithinEpsilon(BASE_SNAPSHOT, {
        ...BASE_SNAPSHOT,
      }),
    ).toBe(true);
  });

  it('should return true when a numeric value differs by less than the epsilon', () => {
    expect(
      isGeometrySnapshotEqualWithinEpsilon(BASE_SNAPSHOT, {
        ...BASE_SNAPSHOT,
        x: BASE_SNAPSHOT.x + GEOMETRY_EPSILON_PIXELS / 2,
      }),
    ).toBe(true);
  });

  it('should return false when a numeric value differs by more than the epsilon', () => {
    expect(
      isGeometrySnapshotEqualWithinEpsilon(BASE_SNAPSHOT, {
        ...BASE_SNAPSHOT,
        y: BASE_SNAPSHOT.y + GEOMETRY_EPSILON_PIXELS * 2,
      }),
    ).toBe(false);
  });

  it('should return false when a non-numeric value changes', () => {
    expect(
      isGeometrySnapshotEqualWithinEpsilon(BASE_SNAPSHOT, {
        ...BASE_SNAPSHOT,
        cursor: 'default',
      }),
    ).toBe(false);
  });
});
