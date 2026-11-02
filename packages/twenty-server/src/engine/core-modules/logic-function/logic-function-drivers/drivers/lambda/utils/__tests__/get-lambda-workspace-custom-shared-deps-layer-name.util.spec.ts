import { getLambdaWorkspaceCustomSharedDepsLayerName } from 'src/engine/core-modules/logic-function/logic-function-drivers/drivers/lambda/utils/get-lambda-workspace-custom-shared-deps-layer-name.util';

describe('getLambdaWorkspaceCustomSharedDepsLayerName', () => {
  it('names the layer shared by workspace custom applications after their yarn.lock', () => {
    expect(
      getLambdaWorkspaceCustomSharedDepsLayerName({
        yarnLockChecksum: 'abc123',
        namespace: 'ns123',
      }),
    ).toBe('depsv1-ns123-custom-abc123');
  });

  it('omits the namespace segment when it is an empty string', () => {
    expect(
      getLambdaWorkspaceCustomSharedDepsLayerName({
        yarnLockChecksum: 'abc123',
        namespace: '',
      }),
    ).toBe('depsv1-custom-abc123');
  });
});
