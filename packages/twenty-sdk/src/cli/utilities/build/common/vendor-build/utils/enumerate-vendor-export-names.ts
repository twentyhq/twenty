import { type VendorExportNames } from '@/cli/utilities/build/common/vendor-build/types/vendor-export-names.type';
import { isNonEmptyArray } from '@sniptt/guards';
import * as esbuild from 'esbuild';
import { createRequire } from 'node:module';
import { pathToFileURL } from 'node:url';
import { join } from 'path';
import { isDefined } from 'twenty-shared/utils';

const NODE_CJS_INTEROP_SYNTHETIC_EXPORT_NAMES = ['module.exports'];

const DEFAULT_EXPORT_NAME = 'default';

const buildNamedExportsProbeSource = (specifier: string): string =>
  `export * from ${JSON.stringify(specifier)};`;

const buildDefaultExportProbeSource = (specifier: string): string =>
  `export { default } from ${JSON.stringify(specifier)};`;

const resolveProbeWithEsbuild = async ({
  appPath,
  probeSource,
}: {
  appPath: string;
  probeSource: string;
}): Promise<esbuild.BuildResult | null> => {
  try {
    return await esbuild.build({
      stdin: {
        contents: probeSource,
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
  } catch {
    return null;
  }
};

const enumerateNamedExportsWithEsbuild = async ({
  appPath,
  specifier,
}: {
  appPath: string;
  specifier: string;
}): Promise<string[]> => {
  const probeResult = await resolveProbeWithEsbuild({
    appPath,
    probeSource: buildNamedExportsProbeSource(specifier),
  });

  if (!isDefined(probeResult)) {
    return [];
  }

  return Object.values(probeResult.metafile?.outputs ?? {})[0]?.exports ?? [];
};

const hasDefaultExportResolvableByEsbuild = async ({
  appPath,
  specifier,
}: {
  appPath: string;
  specifier: string;
}): Promise<boolean> =>
  isDefined(
    await resolveProbeWithEsbuild({
      appPath,
      probeSource: buildDefaultExportProbeSource(specifier),
    }),
  );

const enumerateExportsByImportingInNode = async ({
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
        !NODE_CJS_INTEROP_SYNTHETIC_EXPORT_NAMES.includes(exportName),
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
  const esbuildNamedExports = await enumerateNamedExportsWithEsbuild({
    appPath,
    specifier,
  });
  const nodeExports = await enumerateExportsByImportingInNode({
    appPath,
    specifier,
  });

  if (!isNonEmptyArray(esbuildNamedExports) && !isNonEmptyArray(nodeExports)) {
    throw new Error(
      `Unable to determine the exports of vendor dependency "${specifier}". Check that it is installed and importable from the application.`,
    );
  }

  const hasDefaultExport = await hasDefaultExportResolvableByEsbuild({
    appPath,
    specifier,
  });

  const namedExports = [...new Set([...esbuildNamedExports, ...nodeExports])]
    .filter((exportName) => exportName !== DEFAULT_EXPORT_NAME)
    .sort();

  return { namedExports, hasDefaultExport };
};
