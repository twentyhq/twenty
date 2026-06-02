import { getSdkLayerName } from 'src/engine/core-modules/logic-function/logic-function-drivers/drivers/lambda/utils/get-sdk-layer-name';

describe('getSdkLayerName', () => {
  it('joins prefix with workspaceId and applicationUniversalIdentifier', () => {
    expect(
      getSdkLayerName({
        workspaceId: 'ws-1',
        applicationUniversalIdentifier: 'app-2',
      }),
    ).toBe('sdk-ws-1-app-2');
  });

  it('produces distinct names for distinct identifiers', () => {
    const a = getSdkLayerName({
      workspaceId: 'a',
      applicationUniversalIdentifier: 'x',
    });
    const b = getSdkLayerName({
      workspaceId: 'b',
      applicationUniversalIdentifier: 'x',
    });

    expect(a).not.toBe(b);
  });
});
