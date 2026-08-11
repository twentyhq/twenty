import { mkdtemp, readFile, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'path';

import * as esbuild from 'esbuild';
import {
  OUTPUT_DIR,
  SHARED_DEPENDENCIES_IMPORT_SPECIFIER,
} from 'twenty-shared/application';

import { MINIMAL_APP_PATH } from '@/cli/__tests__/apps/fixture-paths';
import { getBaseFrontComponentBuildOptions } from '@/cli/utilities/build/common/front-component-build/utils/get-base-front-component-build-options';
import { getFrontComponentBuildPlugins } from '@/cli/utilities/build/common/front-component-build/utils/get-front-component-build-plugins';
import { buildSharedDependenciesBundle } from '@/cli/utilities/build/common/shared-dependencies-build/build-shared-dependencies-bundle';
import { removeBuiltSharedDependenciesBundle } from '@/cli/utilities/build/common/shared-dependencies-build/__tests__/utils/remove-built-shared-dependencies-bundle';
import { type SharedDependenciesBuildContext } from '@/cli/utilities/build/common/shared-dependencies-build/types/shared-dependencies-build-context.type';

const REACT_BUNDLED_MARKER = '@license React';

const SHARED_DEPENDENCIES_MANIFEST = {
  dependencies: ['react', 'react/jsx-runtime', 'react-dom/client'],
  sourcePath: 'front-component-shared-dependencies.ts',
  builtPath: 'front-component-shared-dependencies.mjs',
  builtChecksum: null,
};

const buildFrontComponent = async ({
  outputDir,
  sharedDependenciesBuildContext,
}: {
  outputDir: string;
  sharedDependenciesBuildContext: SharedDependenciesBuildContext | null;
}) => {
  const result = await esbuild.build({
    ...getBaseFrontComponentBuildOptions(),
    entryPoints: [join(MINIMAL_APP_PATH, 'my.front-component.tsx')],
    outdir: outputDir,
    plugins: getFrontComponentBuildPlugins({
      getSharedDependenciesBuildContext: () => sharedDependenciesBuildContext,
    }),
  });

  const output = await readFile(
    join(outputDir, 'my.front-component.mjs'),
    'utf-8',
  );

  return { result, output };
};

describe('shared dependencies build', () => {
  let sharedDependenciesBuildContext: SharedDependenciesBuildContext;
  let sharedDependenciesChecksum: string;

  beforeAll(async () => {
    sharedDependenciesBuildContext = await buildSharedDependenciesBundle({
      appPath: MINIMAL_APP_PATH,
      sharedDependencies: SHARED_DEPENDENCIES_MANIFEST,
      onFileBuilt: ({ checksum }) => {
        sharedDependenciesChecksum = checksum;
      },
    });
  }, 120000);

  afterAll(async () => {
    await removeBuiltSharedDependenciesBundle({
      appPath: MINIMAL_APP_PATH,
      builtPath: SHARED_DEPENDENCIES_MANIFEST.builtPath,
    });
  });

  it('bundles every declared dependency behind its own namespace export', async () => {
    const sharedDependenciesBundle = await readFile(
      join(
        MINIMAL_APP_PATH,
        OUTPUT_DIR,
        SHARED_DEPENDENCIES_MANIFEST.builtPath,
      ),
      'utf-8',
    );

    expect(sharedDependenciesBundle).toContain('__shared_dependencies_react__');
    expect(sharedDependenciesBundle).toContain(
      '__shared_dependencies_react_jsx_runtime__',
    );
    expect(sharedDependenciesBundle).toContain(
      '__shared_dependencies_react_dom_client__',
    );
    expect(sharedDependenciesChecksum).toMatch(/^[0-9a-f]{64}$/);
  });

  it('exposes the wrapped react runtime through the shared namespaces', async () => {
    const sharedDependenciesBundle = await readFile(
      join(
        MINIMAL_APP_PATH,
        OUTPUT_DIR,
        SHARED_DEPENDENCIES_MANIFEST.builtPath,
      ),
      'utf-8',
    );

    expect(sharedDependenciesBundle).toContain(
      '__HTML_TAG_TO_CUSTOM_ELEMENT_TAG__',
    );
  });

  it('enumerates the exports every shared dependency provides', () => {
    const reactExportNames =
      sharedDependenciesBuildContext.exportNamesBySpecifier.get('react');
    const reactDomClientExportNames =
      sharedDependenciesBuildContext.exportNamesBySpecifier.get(
        'react-dom/client',
      );

    expect(reactExportNames?.namedExports).toContain('useState');
    expect(reactExportNames?.namedExports).toContain('createElement');
    expect(reactExportNames?.hasDefaultExport).toBe(true);
    expect(reactDomClientExportNames?.namedExports).toContain('createRoot');
  });

  it('keeps react out of a front component bundle that shares them', async () => {
    const outputDir = await mkdtemp(
      join(tmpdir(), 'shared-dependencies-component-'),
    );

    try {
      const { result, output } = await buildFrontComponent({
        outputDir,
        sharedDependenciesBuildContext,
      });

      expect(output).toContain(SHARED_DEPENDENCIES_IMPORT_SPECIFIER);
      expect(output).not.toContain(REACT_BUNDLED_MARKER);

      const outputMeta = Object.values(result.metafile?.outputs ?? {}).find(
        (metaOutput) => metaOutput.entryPoint?.endsWith('.tsx'),
      );

      expect(
        outputMeta?.imports.some(
          (moduleImport) =>
            moduleImport.external === true &&
            moduleImport.path === SHARED_DEPENDENCIES_IMPORT_SPECIFIER,
        ),
      ).toBe(true);
    } finally {
      await rm(outputDir, { recursive: true, force: true });
    }
  }, 60000);

  it('bundles react into a front component when no shared dependencies are declared', async () => {
    const outputDir = await mkdtemp(join(tmpdir(), 'plain-component-'));

    try {
      const { output } = await buildFrontComponent({
        outputDir,
        sharedDependenciesBuildContext: null,
      });

      expect(output).not.toContain(SHARED_DEPENDENCIES_IMPORT_SPECIFIER);
      expect(output).toContain(REACT_BUNDLED_MARKER);
    } finally {
      await rm(outputDir, { recursive: true, force: true });
    }
  }, 60000);

  it('shrinks a front component that shares its dependencies', async () => {
    const sharedOutputDir = await mkdtemp(join(tmpdir(), 'shared-size-'));
    const plainOutputDir = await mkdtemp(join(tmpdir(), 'plain-size-'));

    try {
      const { output: sharedOutput } = await buildFrontComponent({
        outputDir: sharedOutputDir,
        sharedDependenciesBuildContext,
      });
      const { output: plainOutput } = await buildFrontComponent({
        outputDir: plainOutputDir,
        sharedDependenciesBuildContext: null,
      });

      expect(sharedOutput.length).toBeLessThan(plainOutput.length / 2);
    } finally {
      await rm(sharedOutputDir, { recursive: true, force: true });
      await rm(plainOutputDir, { recursive: true, force: true });
    }
  }, 60000);
});
