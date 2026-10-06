import { mkdtemp, writeFile, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { pathToFileURL } from 'node:url';
import * as esbuild from 'esbuild';
import { getSharedDependenciesEntrySource } from '../utils/get-shared-dependencies-entry-source';
import { getSharedDependenciesShimSource } from '../utils/get-shared-dependencies-shim-source';
import { FRONT_COMPONENT_SHARED_DEPENDENCIES_IMPORT_SPECIFIER } from 'twenty-shared/application';
import { describe, expect, it } from 'vitest';

import { MINIMAL_APP_PATH } from '@/app/__tests__/utils/fixture-paths';
import { enumerateSharedDependenciesExportNames } from '@/app/bundles/front-component-build/shared-dependencies-build/utils/enumerate-shared-dependencies-export-names';

describe('enumerateSharedDependenciesExportNames', () => {
  it('discovers browser-only exports without evaluating the dependency', async () => {
    const appPath = await mkdtemp(join(tmpdir(), 'browser-dependency-'));

    try {
      await writeFile(
        join(appPath, 'browser.mjs'),
        "export const element = document.createElement('div'); export default window.location;",
      );
      expect(
        await enumerateSharedDependenciesExportNames({
          appPath,
          specifier: './browser.mjs',
        }),
      ).toEqual({ namedExports: ['element'], hasDefaultExport: true });
    } finally {
      await rm(appPath, { recursive: true, force: true });
    }
  });

  it('preserves live bindings through the built shared bundle and component shim', async () => {
    const appPath = await mkdtemp(join(tmpdir(), 'shared-binding-'));
    const specifier = './counter.mjs';

    try {
      await writeFile(
        join(appPath, specifier),
        'export let count = 0; export const increment = () => count++;',
      );
      const names = await enumerateSharedDependenciesExportNames({
        appPath,
        specifier,
      });
      const bundlePath = join(appPath, 'shared.mjs');

      await esbuild.build({
        stdin: {
          contents: getSharedDependenciesEntrySource(
            new Map([[specifier, names]]),
          ),
          resolveDir: appPath,
        },
        bundle: true,
        format: 'esm',
        outfile: bundlePath,
      });
      const shim = getSharedDependenciesShimSource({
        specifier,
        exportNames: names,
      }).replaceAll(
        FRONT_COMPONENT_SHARED_DEPENDENCIES_IMPORT_SPECIFIER,
        pathToFileURL(bundlePath).href,
      );
      const module = await import(
        `data:text/javascript;base64,${Buffer.from(shim).toString('base64')}`
      );

      expect(module.count).toBe(0);
      module.increment();
      expect(module.count).toBe(1);
    } finally {
      await rm(appPath, { recursive: true, force: true });
    }
  });

  it('reports the named exports and the default of a commonjs dependency', async () => {
    const exportNames = await enumerateSharedDependenciesExportNames({
      appPath: MINIMAL_APP_PATH,
      specifier: 'react',
    });

    expect(exportNames.namedExports).toContain('useState');
    expect(exportNames.namedExports).not.toContain('default');
    expect(exportNames.hasDefaultExport).toBe(true);
  }, 60000);

  it('reports no default for an es module without one', async () => {
    const exportNames = await enumerateSharedDependenciesExportNames({
      appPath: MINIMAL_APP_PATH,
      specifier: '@remote-dom/core',
    });

    expect(exportNames.namedExports).toContain('ROOT_ID');
    expect(exportNames.hasDefaultExport).toBe(false);
  }, 60000);

  it('throws for a dependency the application cannot resolve', async () => {
    await expect(
      enumerateSharedDependenciesExportNames({
        appPath: MINIMAL_APP_PATH,
        specifier: 'this-package-does-not-exist',
      }),
    ).rejects.toThrow('Unable to determine the exports');
  }, 60000);
});
