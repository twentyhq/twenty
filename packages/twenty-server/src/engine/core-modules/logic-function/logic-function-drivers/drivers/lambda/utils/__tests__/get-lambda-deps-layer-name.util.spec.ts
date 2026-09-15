import { type FlatApplication } from 'src/engine/core-modules/application/types/flat-application.type';
import { getLambdaDepsLayerName } from 'src/engine/core-modules/logic-function/logic-function-drivers/drivers/lambda/utils/get-lambda-deps-layer-name.util';
import { getDepsLayerChecksum } from 'src/engine/core-modules/logic-function/logic-function-drivers/utils/get-deps-layer-checksum.util';

const buildFlatApplication = (
  overrides: Partial<FlatApplication> = {},
): FlatApplication =>
  ({
    packageJsonChecksum: 'pkg123',
    yarnLockChecksum: 'abc123',
    ...overrides,
  }) as FlatApplication;

describe('getLambdaDepsLayerName', () => {
  it('returns deps-<combined checksum>', () => {
    const flatApplication = buildFlatApplication();

    expect(getLambdaDepsLayerName({ flatApplication })).toBe(
      `deps-${getDepsLayerChecksum(flatApplication)}`,
    );
  });

  it('inserts the namespace segment when provided', () => {
    const flatApplication = buildFlatApplication();

    expect(
      getLambdaDepsLayerName({ flatApplication, namespace: 'ns123' }),
    ).toBe(`deps-ns123-${getDepsLayerChecksum(flatApplication)}`);
  });

  it('omits the namespace segment when it is an empty string', () => {
    const flatApplication = buildFlatApplication();

    expect(getLambdaDepsLayerName({ flatApplication, namespace: '' })).toBe(
      `deps-${getDepsLayerChecksum(flatApplication)}`,
    );
  });

  it('does not share a layer name between applications with the same yarn.lock but a different package.json', () => {
    const nameA = getLambdaDepsLayerName({
      flatApplication: buildFlatApplication({ packageJsonChecksum: 'pkg-a' }),
    });
    const nameB = getLambdaDepsLayerName({
      flatApplication: buildFlatApplication({ packageJsonChecksum: 'pkg-b' }),
    });

    expect(nameA).not.toBe(nameB);
  });
});
