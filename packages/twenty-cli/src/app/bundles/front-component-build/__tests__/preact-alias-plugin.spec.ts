import { mkdir, mkdtemp, readFile, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import * as esbuild from 'esbuild';
import { expect, it } from 'vitest';
import { createPreactAliasPlugin } from '@/app/bundles/front-component-build/preact-alias-plugin';

it('resolves react-dom/client against each importing workspace', async () => {
  const root = await mkdtemp(join(tmpdir(), 'preact-workspaces-'));
  try {
    for (const name of ['first', 'second']) {
      const workspace = join(root, name);
      await mkdir(join(workspace, 'node_modules/preact/compat'), {
        recursive: true,
      });
      await writeFile(
        join(workspace, 'node_modules/preact/package.json'),
        JSON.stringify({
          name: 'preact',
          exports: { './compat/client': './compat/client.js' },
        }),
      );
      await writeFile(
        join(workspace, 'node_modules/preact/compat/client.js'),
        `export const version = '${name}';`,
      );
      await writeFile(
        join(workspace, 'index.js'),
        "export { version } from 'react-dom/client';",
      );
    }
    const outdir = join(root, 'out');
    await esbuild.build({
      entryPoints: [
        join(root, 'first/index.js'),
        join(root, 'second/index.js'),
      ],
      bundle: true,
      format: 'esm',
      outdir,
      plugins: [createPreactAliasPlugin()],
    });
    expect(await readFile(join(outdir, 'first/index.js'), 'utf8')).toContain(
      '"first"',
    );
    expect(await readFile(join(outdir, 'second/index.js'), 'utf8')).toContain(
      '"second"',
    );
  } finally {
    await rm(root, { recursive: true, force: true });
  }
});
