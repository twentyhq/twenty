import { it, expect, vi } from 'vitest';
import { createHash } from 'crypto';
import { mkdtemp, mkdir, readFile, rm, writeFile } from 'fs/promises';
import { tmpdir } from 'os';
import { join } from 'path';
import { build, transform } from 'esbuild';
import { runInNewContext } from 'vm';
import { FileFolder } from 'twenty-shared/types';
import {
  computeDependencyFileChecksum,
  computePackageJsonChecksum,
  FRONT_COMPONENT_SHARED_DEPENDENCIES_IMPORT_SPECIFIER,
} from 'twenty-shared/application';
import {
  getSharedDependenciesShimSource,
  type SharedDependenciesBuildManifest,
} from 'twenty-shared/front-component-build';

import { buildSharedDependenciesBundle } from '@/app/bundles/front-component-build/shared-dependencies-build/build-shared-dependencies-bundle';

it('ships the export map needed to compile another component against the uploaded app bundle', async () => {
  const appPath = await mkdtemp(join(tmpdir(), 'app-shared-dependencies-'));
  const packageJson = JSON.stringify({
    dependencies: { 'fixture-library': '1.0.0' },
  });
  const yarnLock = 'fixture-lock';
  try {
    const packagePath = join(appPath, 'node_modules/fixture-library');
    await mkdir(packagePath, { recursive: true });
    await writeFile(
      join(packagePath, 'package.json'),
      JSON.stringify({
        name: 'fixture-library',
        main: 'index.js',
        type: 'module',
      }),
    );
    await writeFile(
      join(packagePath, 'index.js'),
      'export const label = "Current app"; export default 42;',
    );
    await writeFile(join(appPath, 'package.json'), packageJson);
    await writeFile(join(appPath, 'yarn.lock'), yarnLock);
    const onFileBuilt = vi.fn();
    const builtPath = 'shared.mjs';
    await buildSharedDependenciesBundle({
      appPath,
      outputDir: 'output',
      sharedDependencies: {
        dependencies: ['fixture-library'],
        builtPath,
        builtChecksum: null,
      },
      onFileBuilt,
    });
    const source = await readFile(join(appPath, 'output', builtPath), 'utf8');
    const manifest: SharedDependenciesBuildManifest = JSON.parse(
      await readFile(join(appPath, 'output', `${builtPath}.json`), 'utf8'),
    );
    expect(manifest).toEqual({
      checksum: createHash('sha256').update(source).digest('hex'),
      packageJsonChecksum: computePackageJsonChecksum(packageJson),
      yarnLockChecksum: computeDependencyFileChecksum(yarnLock),
      exports: {
        'fixture-library': { namedExports: ['label'], hasDefaultExport: true },
      },
    });
    expect(onFileBuilt).toHaveBeenCalledWith(
      expect.objectContaining({
        fileFolder: FileFolder.Dependencies,
        builtPath: join('output', `${builtPath}.json`),
      }),
    );
    const linked = await build({
      stdin: {
        contents: getSharedDependenciesShimSource({
          specifier: 'fixture-library',
          exportNames: manifest.exports['fixture-library'],
        }),
      },
      bundle: true,
      write: false,
      format: 'esm',
      plugins: [
        {
          name: 'stored-app-bundle',
          setup(builder) {
            builder.onResolve(
              { filter: /^twenty:front-component-shared-dependencies$/ },
              () => ({
                path: FRONT_COMPONENT_SHARED_DEPENDENCIES_IMPORT_SPECIFIER,
                namespace: 'app-bundle',
              }),
            );
            builder.onLoad({ filter: /.*/, namespace: 'app-bundle' }, () => ({
              contents: source,
            }));
          },
        },
      ],
    });
    const compiled = await transform(linked.outputFiles[0].text, {
      format: 'cjs',
    });
    const module = { exports: {} };
    runInNewContext(compiled.code, { module });
    expect(module.exports).toMatchObject({ label: 'Current app', default: 42 });
  } finally {
    await rm(appPath, { recursive: true, force: true });
  }
});
