import { findOutdatedLambdaDepsLayerArns } from 'src/engine/core-modules/logic-function/logic-function-drivers/drivers/lambda/utils/find-outdated-lambda-deps-layer-arns.util';

const toLayerArn = (layerName: string) =>
  `arn:aws:lambda:eu-central-1:000000000000:layer:${layerName}:3`;

const YARN_LOCK_CHECKSUM = '0123456789abcdef0123456789abcdef';
const DEPS_LAYER_NAME = `depsv1-ns123-20202020-0000-0000-0000-00000000000a-${YARN_LOCK_CHECKSUM}`;
const WORKSPACE_CUSTOM_DEPS_LAYER_NAME = `depsv1-ns123-custom-${YARN_LOCK_CHECKSUM}`;
const SDK_LAYER_NAME = 'sdk-workspace-application';

const findOutdated = (layerNames: string[]) =>
  findOutdatedLambdaDepsLayerArns({
    layerArns: layerNames.map(toLayerArn),
    depsLayerNames: [WORKSPACE_CUSTOM_DEPS_LAYER_NAME, DEPS_LAYER_NAME],
    sdkLayerName: SDK_LAYER_NAME,
  });

describe('findOutdatedLambdaDepsLayerArns', () => {
  it('finds nothing on a function already on one of its v1 layers', () => {
    expect(findOutdated([DEPS_LAYER_NAME, SDK_LAYER_NAME])).toEqual([]);
    expect(
      findOutdated([WORKSPACE_CUSTOM_DEPS_LAYER_NAME, SDK_LAYER_NAME]),
    ).toEqual([]);
  });

  it('finds a legacy layer of any naming', () => {
    for (const legacyLayerName of [
      `deps-ns123-${YARN_LOCK_CHECKSUM}`,
      'deps-ns123-default',
      YARN_LOCK_CHECKSUM,
    ]) {
      expect(findOutdated([legacyLayerName, SDK_LAYER_NAME])).toEqual([
        toLayerArn(legacyLayerName),
      ]);
    }
  });

  it('finds a v1 layer built for another yarn.lock', () => {
    const otherLayerName =
      'depsv1-ns123-20202020-0000-0000-0000-00000000000a-fedcba9876543210fedcba9876543210';

    expect(findOutdated([otherLayerName, SDK_LAYER_NAME])).toEqual([
      toLayerArn(otherLayerName),
    ]);
  });

  it('keeps the SDK layer', () => {
    expect(findOutdated([SDK_LAYER_NAME])).toEqual([]);
  });
});
