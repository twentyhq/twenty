import { PENDING_UPLOAD_PATH_PREFIX } from 'src/engine/core-modules/file/file-upload/constants/pending-upload-path-prefix.constant';

// Kept verbatim so path and extension validation behave identically in quarantine.
export const buildPendingUploadResourcePath = ({
  fileId,
  resourcePath,
}: {
  fileId: string;
  resourcePath: string;
}): string => `${PENDING_UPLOAD_PATH_PREFIX}/${fileId}/${resourcePath}`;
