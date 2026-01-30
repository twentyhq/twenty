import { type FieldFilesValueItem } from '@/object-record/record-field/ui/types/FieldMetadata';
import { buildSignedPath } from 'twenty-shared/utils';

export const getFileUrl = (file: FieldFilesValueItem): string => {
  const serverUrl = import.meta.env.VITE_SERVER_BASE_URL;

  if (!file.fileId) {
    return '';
  }

  // If we have a token, build a signed path
  if (file.token) {
    const signedPath = buildSignedPath({
      path: file.fileId,
      token: file.token,
    });
    return `${serverUrl}/files/${signedPath}`;
  }

  // Otherwise just use the fileId
  return `${serverUrl}/files/${file.fileId}`;
};
