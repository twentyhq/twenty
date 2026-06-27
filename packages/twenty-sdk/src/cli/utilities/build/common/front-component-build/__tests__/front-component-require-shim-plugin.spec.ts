import { mkdtemp, readFile, rm, writeFile } from 'node:fs/promises';
import { createContext, runInContext } from 'node:vm';
import { join } from 'path';

import * as esbuild from 'esbuild';

import { getBaseFrontComponentBuildOptions } from '@/cli/utilities/build/common/front-component-build/utils/get-base-front-component-build-options';
import { getFrontComponentBuildPlugins } from '@/cli/utilities/build/common/front-component-build/utils/get-front-component-build-plugins';

// A twenty-sdk/ui component drags in deps whose require("react") is frozen into a
// captured call (react-responsive's UMD, use-sync-external-store's shim). Bundled
// for the remote-dom worker, that call throws "Dynamic require of react" unless a
// worker `require` is provided. This is the real reproduction vector for #21603.
const ENTRY_SOURCE = `
  import { Button } from 'twenty-sdk/ui';
  export default function Component() {
    return <Button title="x" onClick={() => {}} />;
  }
`;

const buildBundle = async (format: 'esm' | 'cjs') => {
  const directory = await mkdtemp(join(__dirname, 'require-shim-'));

  try {
    const entryPath = join(directory, 'entry.tsx');
    await writeFile(entryPath, ENTRY_SOURCE, 'utf-8');

    await esbuild.build({
      ...getBaseFrontComponentBuildOptions(),
      plugins: getFrontComponentBuildPlugins({ usePreact: true }),
      minify: false,
      format,
      outExtension: format === 'esm' ? { '.js': '.mjs' } : { '.js': '.cjs' },
      entryPoints: [entryPath],
      outdir: directory,
      logLevel: 'silent',
    });

    return await readFile(
      join(directory, format === 'esm' ? 'entry.mjs' : 'entry.cjs'),
      'utf-8',
    );
  } finally {
    await rm(directory, { recursive: true, force: true });
  }
};

describe('front-component require shim plugin', () => {
  it('injects a prelude that installs globalThis.require mapping the React ids', async () => {
    const output = await buildBundle('esm');

    expect(output).toContain('globalThis.require =');
    expect(output).toContain('__frontComponentReactModules');
    // The component still contains the captured require the shim exists to serve.
    expect(output).toContain('Dynamic require of');
  }, 120000);

  it('serves the captured require("react") with Preact in a worker-like context (no require)', async () => {
    const output = await buildBundle('cjs');

    // A remote-dom worker has no `require`; mirror that by omitting it from the
    // context. The prelude must define globalThis.require at module-init time.
    const moduleStub = { exports: {} as Record<string, unknown> };
    const sandbox: Record<string, unknown> = {
      module: moduleStub,
      exports: moduleStub.exports,
      console,
      document: {
        createElement: () => ({ setAttribute() {}, appendChild() {} }),
        head: { appendChild() {} },
      },
      window: { matchMedia: undefined },
    };
    sandbox.self = sandbox;
    sandbox.globalThis = sandbox;

    const context = createContext(sandbox);
    runInContext(output, context);

    // `require` must not have existed before the prelude ran.
    expect(typeof sandbox.require).toBe('function');

    const resolvedReact = (sandbox.require as (id: string) => unknown)(
      'react',
    ) as Record<string, unknown>;

    // Preact/compat shape — proves the captured require("react") now resolves to
    // the bundled Preact instead of throwing.
    expect(typeof resolvedReact.useState).toBe('function');
    expect(typeof resolvedReact.createElement).toBe('function');
    expect(typeof resolvedReact.useSyncExternalStore).toBe('function');
  }, 120000);
});
