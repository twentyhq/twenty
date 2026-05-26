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

  const { ext: detectedExt, mime: detectedMime } =
    (await fileTypeParser.fromBuffer(file)) ?? {};

  if (isDefined(detectedExt) && isDefined(detectedMime)) {
    return {
      mimeType: detectedMime,
      ext: detectedExt,
    };
  }

  const ext = declaredExt;

  let mimeType: string = 'application/octet-stream';

  if (isNonEmptyString(ext)) {
    // Twenty policy wins over IANA/mrmime for the (small) set of extensions
    // where the IANA mapping collides with a developer-tooling convention
    // (e.g. .ts → video/mp2t is correct per IANA but means TypeScript here).
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
