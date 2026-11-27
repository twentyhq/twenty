import { describe, expect, it } from 'vitest';

import { fromLogicFunctionConfigToLogicFunctionManifest } from '@/app/manifest/utils/from-logic-function-config-to-logic-function-manifest';

const UNIVERSAL_IDENTIFIER = 'e56d363b-0bdc-4d8a-a393-6f0d1c75bdcf';

describe('fromLogicFunctionConfigToLogicFunctionManifest', () => {
  it('should point the manifest at the onJobFailure export and drop the function itself', async () => {
    const manifest = await fromLogicFunctionConfigToLogicFunctionManifest({
      logicFunctionConfig: {
        universalIdentifier: UNIVERSAL_IDENTIFIER,
        handler: async () => {},
        onJobFailure: async () => {},
      },
      sourceCode: '',
      sourcePath: 'src/answer-request.ts',
    });

    expect(manifest).toMatchObject({
      handlerName: 'default.config.handler',
      jobFailureHandlerName: 'default.config.onJobFailure',
    });
    expect(manifest).not.toHaveProperty('onJobFailure');
  });

  it('should not set a job failure handler name without onJobFailure', async () => {
    const manifest = await fromLogicFunctionConfigToLogicFunctionManifest({
      logicFunctionConfig: {
        universalIdentifier: UNIVERSAL_IDENTIFIER,
        handler: async () => {},
      },
      sourceCode: '',
      sourcePath: 'src/answer-request.ts',
    });

    expect(manifest).not.toHaveProperty('jobFailureHandlerName');
  });
});
