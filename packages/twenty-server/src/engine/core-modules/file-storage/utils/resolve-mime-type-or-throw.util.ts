import { lookup } from 'mrmime';

import { isDefined } from 'twenty-shared/utils';

import { TWENTY_MIME_POLICY } from 'src/engine/core-modules/file/constants/twenty-mime-policy.constant';
import { extractFileInfoOrThrow } from 'src/engine/core-modules/file/utils/extract-file-info-or-throw.utils';

const DEFAULT_MIME_TYPE = 'application/octet-stream';

// Resolves the mime type that should be persisted and served for a writeFile
// call. Buffer/Uint8Array sources are validated against their bytes
// (magic-byte sniffing) and the resolved mime comes from the bytes when
// detectable, falling back to TWENTY_MIME_POLICY then mrmime then
// application/octet-stream. String sources are treated as trusted internal
// content and consult TWENTY_MIME_POLICY → mrmime → octet-stream by extension.
// Throws FileStorageException(INVALID_EXTENSION) when buffer bytes contradict
// the path extension and there is no policy override for it.
export const resolveMimeTypeOrThrow = async ({
  sourceFile,
  resourcePath,
}: {
  sourceFile: Buffer | Uint8Array | string;
  resourcePath: string;
}): Promise<string> => {
  if (typeof sourceFile === 'string') {
    const extension = resourcePath.split('.').pop();

    if (isDefined(extension)) {
      const policyMime = TWENTY_MIME_POLICY[extension];

      if (isDefined(policyMime)) {
        return policyMime;
      }

      return lookup(extension) ?? DEFAULT_MIME_TYPE;
    }

    return DEFAULT_MIME_TYPE;
  }

  const buffer = Buffer.isBuffer(sourceFile)
    ? sourceFile
    : Buffer.from(sourceFile);

  const { mimeType } = await extractFileInfoOrThrow({
    file: buffer,
    filename: resourcePath,
  });

  return mimeType;
};
