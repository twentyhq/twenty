import { buildSdkClientGenerationHandlerBundle } from 'src/engine/core-modules/logic-function/logic-function-drivers/drivers/lambda/utils/build-sdk-client-generation-handler-bundle.util';

describe('buildSdkClientGenerationHandlerBundle', () => {
  let bundle: string;

  beforeAll(async () => {
    bundle = await buildSdkClientGenerationHandlerBundle();
  }, 60_000);

  // esbuild reads the working directory once per process, so changing it here
  // would prove nothing: check that paths are relative to the handler instead.
  it('should write module paths relative to the handler, not the process', () => {
    expect(bundle).toMatch(
      /^\/\/ sdk-client-generation-lambda\.handler\.[jt]s$/m,
    );
  });

  it('should keep esbuild and archiver out of the bundle', () => {
    expect(bundle).toContain('require("esbuild")');
    expect(bundle).toContain('require("archiver")');
  });
});
