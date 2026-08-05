import { type FlatApplication } from 'src/engine/core-modules/application/types/flat-application.type';
import { getLambdaDepsLayerName } from 'src/engine/core-modules/logic-function/logic-function-drivers/drivers/lambda/utils/get-lambda-deps-layer-name.util';

const buildFlatApplication = (
  overrides: Partial<FlatApplication> = {},
): FlatApplication =>
  ({
    id: 'app-id-1',
    yarnLockChecksum: 'abc123',
    packageJsonChecksum: 'pkg456',
    ...overrides,
  }) as FlatApplication;

describe('getLambdaDepsLayerName', () => {
  it('returns deps-<checksum> when yarnLockChecksum is set', () => {
    expect(
      getLambdaDepsLayerName({ flatApplication: buildFlatApplication() }),
    ).toBe('deps-abc123');
  });

  it('falls back to the packageJsonChecksum when yarnLockChecksum is undefined', () => {
    expect(
      getLambdaDepsLayerName({
        flatApplication: buildFlatApplication({ yarnLockChecksum: undefined }),
      }),
    ).toBe('deps-pkg456');
  });

  it('falls back to the packageJsonChecksum when yarnLockChecksum is null', () => {
    expect(
      getLambdaDepsLayerName({
        flatApplication: buildFlatApplication({
          yarnLockChecksum: null as unknown as string,
        }),
      }),
    ).toBe('deps-pkg456');
  });

  it('falls back to the application id when both checksums are missing', () => {
    expect(
      getLambdaDepsLayerName({
        flatApplication: buildFlatApplication({
          yarnLockChecksum: null as unknown as string,
          packageJsonChecksum: null as unknown as string,
        }),
      }),
    ).toBe('deps-app-id-1');
  });

  it('inserts the namespace segment when provided', () => {
    expect(
      getLambdaDepsLayerName({
        flatApplication: buildFlatApplication(),
        namespace: 'ns123',
      }),
    ).toBe('deps-ns123-abc123');
  });

  it('omits the namespace segment when it is an empty string', () => {
    expect(
      getLambdaDepsLayerName({
        flatApplication: buildFlatApplication(),
        namespace: '',
      }),
    ).toBe('deps-abc123');
  });
});
