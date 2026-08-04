import { mkdtemp, readFile, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'path';

import * as esbuild from 'esbuild';
import { OUTPUT_DIR, VENDOR_BUNDLE_IMPORT_SPECIFIER } from 'twenty-shared/application';

import { MINIMAL_APP_PATH } from '@/cli/__tests__/apps/fixture-paths';
import { getBaseFrontComponentBuildOptions } from '@/cli/utilities/build/common/front-component-build/utils/get-base-front-component-build-options';
import { getFrontComponentBuildPlugins } from '@/cli/utilities/build/common/front-component-build/utils/get-front-component-build-plugins';
import { buildVendorBundle } from '@/cli/utilities/build/common/vendor-build/build-vendor-bundle';
import { type VendorBuildContext } from '@/cli/utilities/build/common/vendor-build/types/vendor-build-context.type';

const REACT_BUNDLED_MARKER = '@license React';

const VENDOR_MANIFEST = {
  dependencies: ['react', 'react/jsx-runtime', 'react-dom/client'],
  sourceVendorPath: 'vendor.ts',
  builtVendorPath: 'vendor.mjs',
  builtVendorChecksum: null,
};

const buildFrontComponent = async ({
  outputDir,
  vendorBuildContext,
}: {
  outputDir: string;
  vendorBuildContext: VendorBuildContext | null;
}) => {
  const result = await esbuild.build({
    ...getBaseFrontComponentBuildOptions(),
    entryPoints: [join(MINIMAL_APP_PATH, 'my.front-component.tsx')],
    outdir: outputDir,
    plugins: getFrontComponentBuildPlugins({
      getVendorBuildContext: () => vendorBuildContext,
    }),
  });

  const output = await readFile(
    join(outputDir, 'my.front-component.mjs'),
    'utf-8',
  );

  return { result, output };
};

describe('vendor build', () => {
  let vendorBuildContext: VendorBuildContext;
  let vendorChecksum: string;

  beforeAll(async () => {
    vendorBuildContext = await buildVendorBundle({
      appPath: MINIMAL_APP_PATH,
      vendor: VENDOR_MANIFEST,
      onFileBuilt: ({ checksum }) => {
        vendorChecksum = checksum;
      },
    });
  }, 120000);

  afterAll(async () => {
    await rm(join(MINIMAL_APP_PATH, OUTPUT_DIR), {
      recursive: true,
      force: true,
    });
  });

  it('bundles every declared dependency behind its own namespace export', async () => {
    const vendorBundle = await readFile(
      join(MINIMAL_APP_PATH, OUTPUT_DIR, VENDOR_MANIFEST.builtVendorPath),
      'utf-8',
    );

    expect(vendorBundle).toContain('__vendor_react__');
    expect(vendorBundle).toContain('__vendor_react_jsx_runtime__');
    expect(vendorBundle).toContain('__vendor_react_dom_client__');
    expect(vendorChecksum).toMatch(/^[0-9a-f]{64}$/);
  });

  it('exposes the wrapped react runtime through the vendored namespaces', async () => {
    const vendorBundle = await readFile(
      join(MINIMAL_APP_PATH, OUTPUT_DIR, VENDOR_MANIFEST.builtVendorPath),
      'utf-8',
    );

    expect(vendorBundle).toContain('__HTML_TAG_TO_CUSTOM_ELEMENT_TAG__');
  });

  it('enumerates the exports every vendored dependency provides', () => {
    const reactExportNames =
      vendorBuildContext.exportNamesBySpecifier.get('react');
    const reactDomClientExportNames =
      vendorBuildContext.exportNamesBySpecifier.get('react-dom/client');

    expect(reactExportNames?.namedExports).toContain('useState');
    expect(reactExportNames?.namedExports).toContain('createElement');
    expect(reactExportNames?.hasDefaultExport).toBe(true);
    expect(reactDomClientExportNames?.namedExports).toContain('createRoot');
  });

  it('keeps react out of a front component bundle that vendors it', async () => {
    const outputDir = await mkdtemp(join(tmpdir(), 'vendor-component-'));

    try {
      const { result, output } = await buildFrontComponent({
        outputDir,
        vendorBuildContext,
      });

      expect(output).toContain(VENDOR_BUNDLE_IMPORT_SPECIFIER);
      expect(output).not.toContain(REACT_BUNDLED_MARKER);

      const outputMeta = Object.values(result.metafile?.outputs ?? {}).find(
        (metaOutput) => metaOutput.entryPoint?.endsWith('.tsx'),
      );

      expect(
        outputMeta?.imports.some(
          (moduleImport) =>
            moduleImport.external === true &&
            moduleImport.path === VENDOR_BUNDLE_IMPORT_SPECIFIER,
        ),
      ).toBe(true);
    } finally {
      await rm(outputDir, { recursive: true, force: true });
    }
  }, 60000);

  it('bundles react into a front component when no vendor is declared', async () => {
    const outputDir = await mkdtemp(join(tmpdir(), 'vendorless-component-'));

    try {
      const { output } = await buildFrontComponent({
        outputDir,
        vendorBuildContext: null,
      });

      expect(output).not.toContain(VENDOR_BUNDLE_IMPORT_SPECIFIER);
      expect(output).toContain(REACT_BUNDLED_MARKER);
    } finally {
      await rm(outputDir, { recursive: true, force: true });
    }
  }, 60000);

  it('shrinks a front component that vendors its dependencies', async () => {
    const vendoredOutputDir = await mkdtemp(join(tmpdir(), 'vendored-size-'));
    const vendorlessOutputDir = await mkdtemp(
      join(tmpdir(), 'vendorless-size-'),
    );

    try {
      const { output: vendoredOutput } = await buildFrontComponent({
        outputDir: vendoredOutputDir,
        vendorBuildContext,
      });
      const { output: vendorlessOutput } = await buildFrontComponent({
        outputDir: vendorlessOutputDir,
        vendorBuildContext: null,
      });

      expect(vendoredOutput.length).toBeLessThan(vendorlessOutput.length / 2);
    } finally {
      await rm(vendoredOutputDir, { recursive: true, force: true });
      await rm(vendorlessOutputDir, { recursive: true, force: true });
    }
  }, 60000);
});
