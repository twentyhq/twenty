import FileType from 'file-type';

import { buildFileInfo } from 'src/engine/core-modules/file/utils/build-file-info.utils';

export const extractFileInfo = async ({
  file,
  declaredMimeType,
  filename,
}: {
  file: Buffer;
  declaredMimeType: string | undefined;
  filename: string;
}) => {
  const { ext: declaredExt } = buildFileInfo(filename);

  const detectedFileType = await FileType.fromBuffer(file);

  const mimeType = detectedFileType?.mime ?? declaredMimeType;

  const ext = detectedFileType?.ext ?? declaredExt;

  return {
    mimeType,
    ext,
  };
};
