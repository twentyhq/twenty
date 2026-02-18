import { msg } from '@lingui/core/macro';
import { isNonEmptyString } from '@sniptt/guards';
import FileType, { type MimeType } from 'file-type';
import { lookup } from 'mrmime';
import { isDefined } from 'twenty-shared/utils';

import {
  FileStorageException,
  FileStorageExceptionCode,
} from 'src/engine/core-modules/file-storage/interfaces/file-storage-exception';

import { buildFileInfo } from 'src/engine/core-modules/file/utils/build-file-info.utils';

export const extractFileInfo = async ({
  file,
  filename,
}: {
  file: Buffer;
  filename: string;
}) => {
  const { ext: declaredExt } = buildFileInfo(filename);

  const { ext: detectedExt, mime: detectedMime } =
    (await FileType.fromBuffer(file)) ?? {};

  if (isDefined(detectedExt) && isDefined(detectedMime)) {
    return {
      mimeType: detectedMime,
      ext: detectedExt,
    };
  }

  const ext = declaredExt;

  let mimeType: string = 'application/octet-stream';

  if (isNonEmptyString(ext)) {
    const mimeTypeFromExtension = lookup(ext);

    if (
      mimeTypeFromExtension &&
      FileType.mimeTypes.has(mimeTypeFromExtension as MimeType)
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
