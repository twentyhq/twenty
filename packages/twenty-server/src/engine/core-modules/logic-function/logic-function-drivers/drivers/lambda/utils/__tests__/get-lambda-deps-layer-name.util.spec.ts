import { type FlatApplication } from 'src/engine/core-modules/application/types/flat-application.type';
import { getLambdaDepsLayerName } from 'src/engine/core-modules/logic-function/logic-function-drivers/drivers/lambda/utils/get-lambda-deps-layer-name.util';

const buildFlatApplication = (
  overrides: Partial<FlatApplication> = {},
): FlatApplication =>
  ({
    yarnLockChecksum: 'abc123',
    ...overrides,
  }) as FlatApplication;

describe('getLambdaDepsLayerName', () => {
  it('returns deps-<checksum> when yarnLockChecksum is set', () => {
    expect(getLambdaDepsLayerName(buildFlatApplication())).toBe('deps-abc123');
  });

  it('falls back to deps-default when yarnLockChecksum is undefined', () => {
    expect(
      getLambdaDepsLayerName(
        buildFlatApplication({ yarnLockChecksum: undefined }),
      ),
    ).toBe('deps-default');
  });

  it('falls back to deps-default when yarnLockChecksum is null', () => {
    expect(
      getLambdaDepsLayerName(
        buildFlatApplication({
          yarnLockChecksum: null as unknown as string,
        }),
      ),
    ).toBe('deps-default');
  });

  it('inserts the namespace segment when provided', () => {
    expect(getLambdaDepsLayerName(buildFlatApplication(), 'ns123')).toBe(
      'deps-ns123-abc123',
    );
  });

  it('omits the namespace segment when it is an empty string', () => {
    expect(getLambdaDepsLayerName(buildFlatApplication(), '')).toBe(
      'deps-abc123',
    );
  });
});
