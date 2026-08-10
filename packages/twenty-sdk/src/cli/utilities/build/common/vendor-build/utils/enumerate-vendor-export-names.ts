import { getBaseFrontComponentBuildOptions } from '@/cli/utilities/build/common/front-component-build/utils/get-base-front-component-build-options';
import { type VendorExportNames } from '@/cli/utilities/build/common/vendor-build/types/vendor-export-names.type';
import * as esbuild from 'esbuild';
import { isDefined } from 'twenty-shared/utils';

const DEFAULT_EXPORT_NAME = 'default';

const PROBE_NAMESPACE_IDENTIFIER = 'vendorNamespace';

const buildNamespaceProbeSource = (specifier: string): string =>
  `import * as ${PROBE_NAMESPACE_IDENTIFIER} from ${JSON.stringify(specifier)};\nexport { ${PROBE_NAMESPACE_IDENTIFIER} };`;

const buildProbeBundle = async ({
  appPath,
  specifier,
}: {
  appPath: string;
  specifier: string;
}): Promise<string | null> => {
  try {
    const probeResult = await esbuild.build({
      ...getBaseFrontComponentBuildOptions(),
      stdin: {
        contents: buildNamespaceProbeSource(specifier),
        resolveDir: appPath,
        sourcefile: 'vendor-export-probe.js',
        loader: 'js',
      },
      write: false,
      outfile: 'vendor-export-probe-out.js',
      outExtension: undefined,
      external: [],
      sourcemap: false,
    });

    return (
      probeResult.outputFiles?.find((outputFile) =>
        outputFile.path.endsWith('.js'),
      )?.text ?? null
    );
  } catch {
    return null;
  }
};

const importProbeNamespace = async (
  probeBundleSource: string,
): Promise<Record<string, unknown> | null> => {
  try {
    const probeModuleUrl = `data:text/javascript;base64,${Buffer.from(
      probeBundleSource,
    ).toString('base64')}`;
    const probeModule = (await import(probeModuleUrl)) as Record<
      string,
      Record<string, unknown> | undefined
    >;

    return probeModule[PROBE_NAMESPACE_IDENTIFIER] ?? null;
  } catch {
    return null;
  }
};

export const enumerateVendorExportNames = async ({
  appPath,
  specifier,
}: {
  appPath: string;
  specifier: string;
}): Promise<VendorExportNames> => {
  const probeBundleSource = await buildProbeBundle({ appPath, specifier });

  const vendorNamespace = isDefined(probeBundleSource)
    ? await importProbeNamespace(probeBundleSource)
    : null;

  if (!isDefined(vendorNamespace)) {
    throw new Error(
      `Unable to determine the exports of vendor dependency "${specifier}". Check that it is installed and importable from the application.`,
    );
  }

  const namedExports = Object.keys(vendorNamespace)
    .filter((exportName) => exportName !== DEFAULT_EXPORT_NAME)
    .sort();

  return {
    namedExports,
    hasDefaultExport: DEFAULT_EXPORT_NAME in vendorNamespace,
  };
};
