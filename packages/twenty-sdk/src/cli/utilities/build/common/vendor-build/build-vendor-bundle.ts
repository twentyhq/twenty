import { getBaseFrontComponentBuildOptions } from '@/cli/utilities/build/common/front-component-build/utils/get-base-front-component-build-options';
import { type OnFileBuiltCallback } from '@/cli/utilities/build/common/restartable-watcher-interface';
import { type VendorBuildContext } from '@/cli/utilities/build/common/vendor-build/types/vendor-build-context.type';
import { enumerateVendorExportNames } from '@/cli/utilities/build/common/vendor-build/utils/enumerate-vendor-export-names';
import { getVendorEntrySource } from '@/cli/utilities/build/common/vendor-build/utils/get-vendor-entry-source';
import { getVendorNamespaceCollisions } from '@/cli/utilities/build/common/vendor-build/utils/get-vendor-namespace-collisions';
import { ensureDir } from '@/cli/utilities/file/fs-utils';
import crypto from 'crypto';
import * as esbuild from 'esbuild';
import { readFile } from 'node:fs/promises';
import { dirname, join } from 'path';
import { OUTPUT_DIR, type VendorManifest } from 'twenty-shared/application';
import { FileFolder } from 'twenty-shared/types';
import { isNonEmptyArray } from '@sniptt/guards';

export const buildVendorBundle = async ({
  appPath,
  vendor,
  onFileBuilt,
}: {
  appPath: string;
  vendor: VendorManifest;
  onFileBuilt: OnFileBuiltCallback;
}): Promise<VendorBuildContext> => {
  const namespaceCollisions = getVendorNamespaceCollisions(vendor.dependencies);

  if (isNonEmptyArray(namespaceCollisions)) {
    throw new Error(
      `Vendor dependencies map to the same bundle namespace: ${namespaceCollisions
        .map((specifiers) => specifiers.join(' and '))
        .join(', ')}`,
    );
  }

  const builtPath = join(OUTPUT_DIR, vendor.builtVendorPath);
  const absoluteBuiltPath = join(appPath, builtPath);

  await ensureDir(dirname(absoluteBuiltPath));

  await esbuild.build({
    ...getBaseFrontComponentBuildOptions(),
    stdin: {
      contents: getVendorEntrySource(vendor.dependencies),
      resolveDir: appPath,
      sourcefile: 'twenty-vendor-entry.js',
      loader: 'js',
    },
    outfile: absoluteBuiltPath,
    outExtension: undefined,
    external: [],
  });

  const exportNamesBySpecifier = new Map(
    await Promise.all(
      vendor.dependencies.map(
        async (specifier) =>
          [
            specifier,
            await enumerateVendorExportNames({ appPath, specifier }),
          ] as const,
      ),
    ),
  );

  const content = await readFile(absoluteBuiltPath);
  const checksum = crypto.createHash('sha256').update(content).digest('hex');

  await onFileBuilt({
    fileFolder: FileFolder.BuiltFrontComponent,
    builtPath,
    sourcePath: vendor.sourceVendorPath,
    checksum,
  });

  return { exportNamesBySpecifier };
};
