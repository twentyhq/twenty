import { getLambdaSdkLayerName } from 'src/engine/core-modules/logic-function/logic-function-drivers/drivers/lambda/utils/get-lambda-sdk-layer-name.util';

describe('getLambdaSdkLayerName', () => {
  it('joins prefix with workspaceId and applicationUniversalIdentifier', () => {
    expect(
      getLambdaSdkLayerName({
        workspaceId: 'ws-1',
        applicationUniversalIdentifier: 'app-2',
      }),
    ).toBe('sdk-ws-1-app-2');
  });

  it('produces distinct names for distinct identifiers', () => {
    const a = getLambdaSdkLayerName({
      workspaceId: 'a',
      applicationUniversalIdentifier: 'x',
    });
    const b = getLambdaSdkLayerName({
      workspaceId: 'b',
      applicationUniversalIdentifier: 'x',
    });

    expect(a).not.toBe(b);
  });
});
