import { build } from 'esbuild';

const MAX_PRIMITIVES_BUNDLE_BYTES = 20_000;

describe('twenty-shared/primitives bundle size', () => {
  it('stays small enough to ship in every front component bundle', async () => {
    const result = await build({
      stdin: {
        contents: "export * from 'twenty-shared/primitives';",
        resolveDir: __dirname,
      },
      bundle: true,
      minify: true,
      format: 'esm',
      platform: 'browser',
      write: false,
      logLevel: 'silent',
    });

    expect(result.outputFiles[0].contents.byteLength).toBeLessThan(
      MAX_PRIMITIVES_BUNDLE_BYTES,
    );
  });
});
