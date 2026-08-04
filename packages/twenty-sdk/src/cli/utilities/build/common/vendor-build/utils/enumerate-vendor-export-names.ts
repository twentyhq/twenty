import { type VendorExportNames } from '@/cli/utilities/build/common/vendor-build/types/vendor-export-names.type';
import * as esbuild from 'esbuild';
import { createRequire } from 'node:module';
import { join } from 'path';
import { pathToFileURL } from 'node:url';
import { isNonEmptyArray } from '@sniptt/guards';

// Node's CJS named-export detection exposes this synthetic key, which esbuild's
// interop never produces.
const NODE_INTEROP_ARTIFACT_EXPORT_NAMES = ['module.exports'];

const DEFAULT_EXPORT_NAME = 'default';

const enumerateStatically = async ({
  appPath,
  specifier,
}: {
  appPath: string;
  specifier: string;
}): Promise<string[]> => {
  try {
    const result = await esbuild.build({
      stdin: {
        contents: `export * from ${JSON.stringify(specifier)};`,
        resolveDir: appPath,
        sourcefile: 'vendor-export-probe.js',
        loader: 'js',
      },
      bundle: true,
      write: false,
      metafile: true,
      format: 'esm',
      platform: 'browser',
      logLevel: 'silent',
      loader: { '.css': 'empty' },
      define: { 'process.env.NODE_ENV': '"production"' },
      outfile: 'vendor-export-probe-out.js',
    });

    return Object.values(result.metafile.outputs)[0]?.exports ?? [];
  } catch {
    return [];
  }
};

const enumerateAtRuntime = async ({
  appPath,
  specifier,
}: {
  appPath: string;
  specifier: string;
}): Promise<string[]> => {
  try {
    const appRequire = createRequire(join(appPath, 'package.json'));
    const resolvedPath = appRequire.resolve(specifier);
    const resolvedModule = await import(pathToFileURL(resolvedPath).href);

    return Object.keys(resolvedModule).filter(
      (exportName) =>
        !NODE_INTEROP_ARTIFACT_EXPORT_NAMES.includes(exportName),
    );
  } catch {
    return [];
  }
};

export const enumerateVendorExportNames = async ({
  appPath,
  specifier,
}: {
  appPath: string;
  specifier: string;
}): Promise<VendorExportNames> => {
  const staticNames = await enumerateStatically({ appPath, specifier });
  const runtimeNames = await enumerateAtRuntime({ appPath, specifier });

  if (!isNonEmptyArray(staticNames) && !isNonEmptyArray(runtimeNames)) {
    throw new Error(
      `Unable to determine the exports of vendor dependency "${specifier}". Check that it is installed and importable from the application.`,
    );
  }

  // esbuild sees the same module the vendor bundle will, so when it resolves a
  // real ES module its view decides whether a default export exists. For a
  // CommonJS dependency esbuild reports nothing and its interop always adds a
  // default export, which is what the runtime enumeration observes.
  const hasDefaultExport = isNonEmptyArray(staticNames)
    ? staticNames.includes(DEFAULT_EXPORT_NAME)
    : runtimeNames.includes(DEFAULT_EXPORT_NAME);

  const namedExports = [...new Set([...staticNames, ...runtimeNames])]
    .filter((exportName) => exportName !== DEFAULT_EXPORT_NAME)
    .sort();

  return { namedExports, hasDefaultExport };
};
