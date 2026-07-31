import { getLambdaSdkLayerName } from 'src/engine/core-modules/logic-function/logic-function-drivers/drivers/lambda/utils/get-lambda-sdk-layer-name.util';

describe('getLambdaSdkLayerName', () => {
  it('joins prefix with workspaceId, applicationUniversalIdentifier and metadata checksum', () => {
    expect(
      getLambdaSdkLayerName({
        workspaceId: 'ws-1',
        applicationUniversalIdentifier: 'app-2',
        metadataModuleChecksum: 'abcdef1234567890',
      }),
    ).toBe('sdk-ws-1-app-2-abcdef123456');
  });

  it('produces distinct names for distinct identifiers', () => {
    const a = getLambdaSdkLayerName({
      workspaceId: 'a',
      applicationUniversalIdentifier: 'x',
      metadataModuleChecksum: 'checksum00000',
    });
    const b = getLambdaSdkLayerName({
      workspaceId: 'b',
      applicationUniversalIdentifier: 'x',
      metadataModuleChecksum: 'checksum00000',
    });

    expect(a).not.toBe(b);
  });

  it('produces distinct names when the metadata module checksum changes', () => {
    const a = getLambdaSdkLayerName({
      workspaceId: 'ws',
      applicationUniversalIdentifier: 'app',
      metadataModuleChecksum: 'aaaaaaaaaaaa',
    });
    const b = getLambdaSdkLayerName({
      workspaceId: 'ws',
      applicationUniversalIdentifier: 'app',
      metadataModuleChecksum: 'bbbbbbbbbbbb',
    });

    expect(a).not.toBe(b);
  });
});
