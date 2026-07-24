import { createElementGeometrySnapshotFixture } from '@/__tests__/createElementGeometrySnapshotFixture';
import { isElementGeometryEqualWithinEpsilon } from '../isElementGeometryEqualWithinEpsilon';

describe('isElementGeometryEqualWithinEpsilon', () => {
  it('should treat an undefined previous snapshot as different', () => {
    expect(
      isElementGeometryEqualWithinEpsilon(
        undefined,
        createElementGeometrySnapshotFixture(),
      ),
    ).toBe(false);
  });

  it('should treat a sub-epsilon difference as equal', () => {
    expect(
      isElementGeometryEqualWithinEpsilon(
        createElementGeometrySnapshotFixture({ width: 10 }),
        createElementGeometrySnapshotFixture({ width: 10.01 }),
      ),
    ).toBe(true);
  });

  it('should treat a supra-epsilon difference as different', () => {
    expect(
      isElementGeometryEqualWithinEpsilon(
        createElementGeometrySnapshotFixture({ width: 10 }),
        createElementGeometrySnapshotFixture({ width: 10.5 }),
      ),
    ).toBe(false);
  });

  it('should detect a change in any numeric field', () => {
    expect(
      isElementGeometryEqualWithinEpsilon(
        createElementGeometrySnapshotFixture(),
        createElementGeometrySnapshotFixture({ scrollLeft: 5 }),
      ),
    ).toBe(false);
  });

  it('should treat a change in offsetParentRemoteElementId as different', () => {
    expect(
      isElementGeometryEqualWithinEpsilon(
        createElementGeometrySnapshotFixture({
          offsetParentRemoteElementId: null,
        }),
        createElementGeometrySnapshotFixture({
          offsetParentRemoteElementId: 'remote-element-id',
        }),
      ),
    ).toBe(false);
  });
});
