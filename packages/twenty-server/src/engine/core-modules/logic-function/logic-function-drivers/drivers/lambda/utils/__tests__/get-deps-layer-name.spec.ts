import { type FlatApplication } from 'src/engine/core-modules/application/types/flat-application.type';
import { getDepsLayerName } from 'src/engine/core-modules/logic-function/logic-function-drivers/drivers/lambda/utils/get-deps-layer-name';

const buildFlatApplication = (
  overrides: Partial<FlatApplication> = {},
): FlatApplication =>
  ({
    yarnLockChecksum: 'abc123',
    ...overrides,
  }) as FlatApplication;

describe('getDepsLayerName', () => {
  it('returns deps-<checksum> when yarnLockChecksum is set', () => {
    expect(getDepsLayerName(buildFlatApplication())).toBe('deps-abc123');
  });

  it('falls back to deps-default when yarnLockChecksum is undefined', () => {
    expect(
      getDepsLayerName(buildFlatApplication({ yarnLockChecksum: undefined })),
    ).toBe('deps-default');
  });

  it('falls back to deps-default when yarnLockChecksum is null', () => {
    expect(
      getDepsLayerName(
        buildFlatApplication({
          yarnLockChecksum: null as unknown as string,
        }),
      ),
    ).toBe('deps-default');
  });
});
