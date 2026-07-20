import { createHash } from 'crypto';
import * as fs from 'fs/promises';
import { join } from 'path';

import { SDK_CLIENT_PACKAGE_DIRNAME } from 'src/engine/core-modules/sdk-client/constants/sdk-client-package-dirname';

export type InstalledSdkMetadataModule = {
  moduleBuffer: Buffer;
  checksum: string;
};

let installedSdkMetadataModulePromise:
  | Promise<InstalledSdkMetadataModule>
  | undefined;

// The metadata module of the twenty-client-sdk package is a static build
// artifact: unlike the core module it is never regenerated per application,
// so its content only changes when a new server release ships. It is
// instance-wide: read and hashed once per process, then used both to serve
// the module to browsers and as the metadata part of the content-addressed
// SDK URLs returned to front components.
export const getInstalledSdkMetadataModule =
  (): Promise<InstalledSdkMetadataModule> => {
    if (!installedSdkMetadataModulePromise) {
      installedSdkMetadataModulePromise = fs
        .readFile(join(SDK_CLIENT_PACKAGE_DIRNAME, 'dist', 'metadata.mjs'))
        .then((moduleBuffer) => ({
          moduleBuffer,
          checksum: createHash('sha256').update(moduleBuffer).digest('hex'),
        }));

      // Don't memoize a rejection: a transient read failure should not break
      // metadata module serving for the whole process lifetime.
      installedSdkMetadataModulePromise.catch(() => {
        installedSdkMetadataModulePromise = undefined;
      });
    }

    return installedSdkMetadataModulePromise;
  };

export const getCurrentSdkMetadataModuleChecksum =
  async (): Promise<string> => {
    const { checksum } = await getInstalledSdkMetadataModule();

    return checksum;
  };
