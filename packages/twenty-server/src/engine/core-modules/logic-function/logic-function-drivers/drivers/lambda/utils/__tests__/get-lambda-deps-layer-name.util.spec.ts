import { type FlatApplication } from 'src/engine/core-modules/application/types/flat-application.type';
import { getLambdaDepsLayerName } from 'src/engine/core-modules/logic-function/logic-function-drivers/drivers/lambda/utils/get-lambda-deps-layer-name.util';

const APPLICATION_UNIVERSAL_IDENTIFIER = '20202020-0000-0000-0000-00000000000a';

const buildFlatApplication = (
  overrides: Partial<FlatApplication> = {},
): FlatApplication =>
  ({
    universalIdentifier: APPLICATION_UNIVERSAL_IDENTIFIER,
    packageJsonChecksum: 'def456',
    yarnLockChecksum: 'abc123',
    ...overrides,
  }) as FlatApplication;

describe('getLambdaDepsLayerName', () => {
  it('names the layer of an application after its yarn.lock', () => {
    expect(
      getLambdaDepsLayerName({
        flatApplication: buildFlatApplication(),
        namespace: 'ns123',
      }),
    ).toBe(`depsv1-ns123-${APPLICATION_UNIVERSAL_IDENTIFIER}-abc123`);
  });

  it('names the layer of an application without a yarn.lock after its package.json', () => {
    for (const yarnLockChecksum of [null, undefined]) {
      expect(
        getLambdaDepsLayerName({
          flatApplication: buildFlatApplication({
            yarnLockChecksum: yarnLockChecksum as unknown as string,
          }),
          namespace: 'ns123',
        }),
      ).toBe(`depsv1-ns123-${APPLICATION_UNIVERSAL_IDENTIFIER}-nolock-def456`);
    }
  });

  it('omits the namespace segment when it is an empty string', () => {
    expect(
      getLambdaDepsLayerName({
        flatApplication: buildFlatApplication(),
        namespace: '',
      }),
    ).toBe(`depsv1-${APPLICATION_UNIVERSAL_IDENTIFIER}-abc123`);
  });
});
