import { it, expect, vi } from 'vitest';
import { createHash } from 'crypto';
import { mkdtemp, mkdir, readFile, rm, symlink, writeFile } from 'fs/promises';
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
  decodeFrontComponentTypeReferences,
  createSharedDependenciesShimPlugin,
  getSharedDependenciesShimSource,
  type SharedDependenciesBuildManifest,
} from 'twenty-shared/front-component-build';

import { MINIMAL_APP_PATH } from '@/app/__tests__/utils/fixture-paths';

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
        types: 'index.d.ts',
        type: 'module',
      }),
    );
    await writeFile(
      join(packagePath, 'index.js'),
      'export const label = "Current app"; export default 42;',
    );
    await writeFile(
      join(packagePath, 'index.d.ts'),
      'export declare const label: string; export default 42;',
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
    const typeReferences = await readFile(
      join(appPath, 'output', `${builtPath}.types.json.gz`),
    );
    expect(
      decodeFrontComponentTypeReferences(typeReferences)[
        '/node_modules/fixture-library/index.d.ts'
      ],
    ).toContain('label: string');
    expect(onFileBuilt).toHaveBeenCalledWith(
      expect.objectContaining({
        fileFolder: FileFolder.Dependencies,
        builtPath: join('output', `${builtPath}.types.json.gz`),
      }),
    );
    expect(manifest).toEqual({
      typeReferencesChecksum: createHash('sha256')
        .update(typeReferences)
        .digest('hex'),
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

it('keeps React DOM and Twenty UI available when rebuilding a workspace app with a sparse shared dependency declaration', async () => {
  const appPath = await mkdtemp(
    join(tmpdir(), 'workspace-shared-dependencies-'),
  );
  try {
    await symlink(
      join(MINIMAL_APP_PATH, '../../../../node_modules'),
      join(appPath, 'node_modules'),
    );
    await writeFile(
      join(appPath, 'package.json'),
      JSON.stringify({
        dependencies: { react: '19.2.0' },
        devDependencies: { 'react-dom': '19.2.0', 'twenty-ui': '2.50.0' },
        frontComponentSharedDependencies: ['react'],
      }),
    );
    const context = await buildSharedDependenciesBundle({
      appPath,
      outputDir: 'output',
      sharedDependencies: {
        dependencies: ['react'],
        builtPath: 'shared.mjs',
        builtChecksum: null,
      },
      onFileBuilt: vi.fn(),
    });
    const manifest: SharedDependenciesBuildManifest = JSON.parse(
      await readFile(join(appPath, 'output/shared.mjs.json'), 'utf8'),
    );
    expect(manifest.exports['react-dom'].namedExports).toContain(
      'createPortal',
    );
    expect(manifest.exports['react-dom/client'].namedExports).toContain(
      'createRoot',
    );
    expect(
      manifest.exports['twenty-ui/primitives/input'].namedExports,
    ).toContain('Button');
    expect(manifest.exports['react/jsx-runtime'].namedExports).toContain('jsx');
    const component = await build({
      stdin: {
        contents: `export { createPortal } from 'react-dom';
export { createRoot } from 'react-dom/client';
export { Button } from 'twenty-ui/primitives/input';`,
      },
      bundle: true,
      write: false,
      format: 'esm',
      external: [FRONT_COMPONENT_SHARED_DEPENDENCIES_IMPORT_SPECIFIER],
      plugins: [
        createSharedDependenciesShimPlugin({
          getSharedDependenciesBuildContext: () => context,
        }),
      ],
    });
    const linked = await build({
      stdin: {
        contents: component.outputFiles[0].text,
        resolveDir: appPath,
      },
      alias: {
        [FRONT_COMPONENT_SHARED_DEPENDENCIES_IMPORT_SPECIFIER]: join(
          appPath,
          'output/shared.mjs',
        ),
      },
      bundle: true,
      write: false,
      format: 'cjs',
    });
    const module: { exports: Record<string, unknown> } = { exports: {} };
    runInNewContext(linked.outputFiles[0].text, {
      module,
      exports: module.exports,
    });
    expect(module.exports.createPortal).toBeTypeOf('function');
    expect(module.exports.createRoot).toBeTypeOf('function');
    expect(module.exports.Button).toBeDefined();
  } finally {
    await rm(appPath, { recursive: true, force: true });
  }
}, 30_000);
