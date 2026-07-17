import { createHash } from 'crypto';
import * as fs from 'fs/promises';
import { join } from 'path';

import { SDK_CLIENT_PACKAGE_DIRNAME } from 'src/engine/core-modules/sdk-client/constants/sdk-client-package-dirname';

let currentSdkMetadataModuleChecksumPromise: Promise<string> | undefined;

// The metadata module of the twenty-client-sdk package is a static build
// artifact: unlike the core module it is never regenerated per application,
// so its content only changes when a new server release ships. Hashing the
// installed module once per process gives a release fingerprint to compare
// against the per-application sdkClientMetadataChecksum persisted at SDK
// generation time.
export const getCurrentSdkMetadataModuleChecksum = (): Promise<string> => {
  if (!currentSdkMetadataModuleChecksumPromise) {
    currentSdkMetadataModuleChecksumPromise = fs
      .readFile(join(SDK_CLIENT_PACKAGE_DIRNAME, 'dist', 'metadata.mjs'))
      .then((moduleBuffer) =>
        createHash('sha256').update(moduleBuffer).digest('hex'),
      );

    // Don't memoize a rejection: a transient read failure should not disable
    // staleness detection for the whole process lifetime.
    currentSdkMetadataModuleChecksumPromise.catch(() => {
      currentSdkMetadataModuleChecksumPromise = undefined;
    });
  }

  return currentSdkMetadataModuleChecksumPromise;
};
