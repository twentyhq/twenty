import { PENDING_UPLOAD_PATH_PREFIX } from 'src/engine/core-modules/file/file-upload/constants/pending-upload-path-prefix.constant';

// The final resource path is kept verbatim under the prefix so that path and
// extension validation behave identically for both locations.
export const buildPendingUploadResourcePath = ({
  fileId,
  resourcePath,
}: {
  fileId: string;
  resourcePath: string;
}): string => `${PENDING_UPLOAD_PATH_PREFIX}/${fileId}/${resourcePath}`;
