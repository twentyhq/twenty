import { isNonEmptyString } from '@sniptt/guards';
import FileType from 'file-type';
import { lookup } from 'mrmime';
import { isDefined } from 'twenty-shared/utils';

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
    mimeType = lookup(ext) ?? 'application/octet-stream';
  }

  return {
    mimeType,
    ext,
  };
};
