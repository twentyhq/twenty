import { createHash } from 'crypto';

import { isDefined } from 'twenty-shared/utils';

import {
  SdkClientException,
  SdkClientExceptionCode,
} from 'src/engine/core-modules/sdk-client/exceptions/sdk-client.exception';

const CORE_MODULE_PATH_IN_ARCHIVE = 'dist/core.mjs';

// sha-256 (not md5) so the renderer can verify cached bundles against the URL
// checksum with WebCrypto, which has no md5 support
export const computeSdkClientCoreChecksumFromArchive = async (
  archiveBuffer: Buffer,
): Promise<string> => {
  const { default: unzipper } = await import('unzipper');
  const directory = await unzipper.Open.buffer(archiveBuffer);

  const coreModuleEntry = directory.files.find(
    (file) =>
      file.path === CORE_MODULE_PATH_IN_ARCHIVE ||
      file.path === `./${CORE_MODULE_PATH_IN_ARCHIVE}`,
  );

  if (!isDefined(coreModuleEntry)) {
    throw new SdkClientException(
      `${CORE_MODULE_PATH_IN_ARCHIVE} is missing from the generated SDK client archive`,
      SdkClientExceptionCode.FILE_NOT_FOUND_IN_ARCHIVE,
    );
  }

  return createHash('sha256')
    .update(await coreModuleEntry.buffer())
    .digest('hex');
};
