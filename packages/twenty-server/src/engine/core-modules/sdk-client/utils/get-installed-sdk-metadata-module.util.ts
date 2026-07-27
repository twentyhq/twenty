import { createHash } from 'crypto';
import * as fs from 'fs/promises';
import { join } from 'path';

import { SDK_CLIENT_PACKAGE_DIRNAME } from 'src/engine/core-modules/sdk-client/constants/sdk-client-package-dirname';

export type InstalledSdkMetadataModule = {
  moduleBuffer: Buffer;
  checksum: string;
};

// Warmed once at bootstrap (SdkClientModule.onApplicationBootstrap) and treated
// as a process-lifetime invariant: the module ships inside the server build and
// never changes at runtime. A read/hash failure blocks boot, so a running
// server always has a resolved value here.
let installedSdkMetadataModule: InstalledSdkMetadataModule | undefined;

export const getInstalledSdkMetadataModule =
  async (): Promise<InstalledSdkMetadataModule> => {
    if (!installedSdkMetadataModule) {
      const moduleBuffer = await fs.readFile(
        join(SDK_CLIENT_PACKAGE_DIRNAME, 'dist', 'metadata.mjs'),
      );

      installedSdkMetadataModule = {
        moduleBuffer,
        checksum: createHash('sha256').update(moduleBuffer).digest('hex'),
      };
    }

    return installedSdkMetadataModule;
  };
