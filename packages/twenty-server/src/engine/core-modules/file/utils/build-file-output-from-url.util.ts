import { type FileOutputDTO } from 'src/engine/core-modules/file/dtos/file-output.dto';

export const buildFileOutputFromUrl = (
  url: string | null,
  fileId: string | null = null,
): FileOutputDTO | null => {
  if (url === null) {
    return null;
  }

  return {
    fileId,
    label: null,
    extension: null,
    url,
  };
};
