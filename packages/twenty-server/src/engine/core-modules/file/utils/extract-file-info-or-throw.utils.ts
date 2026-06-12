import { msg } from '@lingui/core/macro';
import { isNonEmptyString } from '@sniptt/guards';
import { FileTypeParser, supportedMimeTypes } from 'file-type';
import { lookup } from 'mrmime';
import { isDefined } from 'twenty-shared/utils';

import {
  FileStorageException,
  FileStorageExceptionCode,
} from 'src/engine/core-modules/file-storage/interfaces/file-storage-exception';

import { detectPdf } from '@file-type/pdf';
import { TWENTY_MIME_POLICY } from 'src/engine/core-modules/file/constants/twenty-mime-policy.constant';
import { buildFileInfo } from 'src/engine/core-modules/file/utils/build-file-info.utils';

const fileTypeParser = new FileTypeParser({
  customDetectors: [detectPdf],
});

export const extractFileInfoOrThrow = async ({
  file,
  filename,
}: {
  file: Buffer;
  filename: string;
}) => {
  const { ext: declaredExt } = buildFileInfo(filename);

  let detectedExt: string | undefined;
  let detectedMime: string | undefined;

  try {
    const result = await fileTypeParser.fromBuffer(file);
    detectedExt = result?.ext;
    detectedMime = result?.mime;
  } catch (error) {
    throw new FileStorageException(
      `File content detection failed: ${(error as Error).message}`,
      FileStorageExceptionCode.INVALID_EXTENSION,
      {
        userFriendlyMessage: msg`The file content could not be detected. The file may be corrupted or have an unsupported format.`,
      },
    );
  }

  if (isDefined(detectedExt) && isDefined(detectedMime)) {
    return {
      mimeType: detectedMime,
      ext: detectedExt,
    };
  }

  const ext = declaredExt;

  let mimeType: string = 'application/octet-stream';

  if (isNonEmptyString(ext)) {
    // Twenty policy wins over the ext-based fallback for the (small) set of
    // extensions where mrmime's IANA mapping collides with a developer-tooling
    // convention. This branch is only reached when file-type's magic-byte
    // sniff returned nothing — when the bytes actually match (e.g. a real
    // MPEG-TS video at foo.ts), we already returned above.
    //
    // For .ts/.tsx the policy is also load-bearing for correctness: without
    // it, lookup('ts') → 'video/mp2t' is in file-type's supportedMimeTypes,
    // so the check below would throw INVALID_EXTENSION on every TypeScript
    // source upload.
    const policyMime = TWENTY_MIME_POLICY[ext];

    if (isDefined(policyMime)) {
      return { mimeType: policyMime, ext };
    }

    const mimeTypeFromExtension = lookup(ext);

    if (
      mimeTypeFromExtension &&
      supportedMimeTypes.has(mimeTypeFromExtension)
    ) {
      throw new FileStorageException(
        `File content does not match its extension. The file has extension '${ext}' (expected mime type: ${mimeTypeFromExtension}), but the file content could not be detected as this type. The file may be corrupted, have the wrong extension, or be a security risk.`,
        FileStorageExceptionCode.INVALID_EXTENSION,
        {
          userFriendlyMessage: msg`The file extension doesn't match the file content. Please check that your file is not corrupted and has the correct extension.`,
        },
      );
    }

    mimeType = mimeTypeFromExtension ?? 'application/octet-stream';
  }

  return {
    mimeType,
    ext,
  };
};
