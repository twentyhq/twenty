import { build } from 'esbuild';
import { writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { rollup } from 'rollup';
import dts from 'rollup-plugin-dts';

const SDK_DIRECTORY = resolve(__dirname, '..');

export const buildAiFrontComponentContext = async () => {
  const entry = resolve(SDK_DIRECTORY, 'src/sdk/front-component/ai-context.ts');
  const runtime = await build({
    entryPoints: [entry],
    bundle: true,
    platform: 'browser',
    format: 'esm',
    external: ['react'],
    minify: true,
    write: false,
    alias: {
      'twenty-shared/utils': resolve(
        SDK_DIRECTORY,
        '../twenty-shared/dist/utils/index.mjs',
      ),
    },
  });
  const declarations = await rollup({
    input: entry,
    external: ['react'],
    plugins: [dts({ tsconfig: resolve(SDK_DIRECTORY, 'tsconfig.lib.json') })],
  });

  try {
    const { output } = await declarations.generate({ format: 'es' });

    return { source: runtime.outputFiles[0].text, types: output[0].code };
  } finally {
    await declarations.close();
  }
};

if (require.main === module) {
  void buildAiFrontComponentContext().then((contextModule) =>
    writeFile(
      resolve(
        SDK_DIRECTORY,
        '../twenty-server/src/engine/metadata-modules/ai/ai-front-component/constants/generated/front-component-context-module.json',
      ),
      `${JSON.stringify(contextModule, null, 2)}\n`,
    ),
  );
}
