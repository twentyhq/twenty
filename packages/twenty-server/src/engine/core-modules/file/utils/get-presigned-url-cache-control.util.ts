import { PRESIGNED_URL_CACHE_CONTROL } from 'src/engine/core-modules/file/interfaces/file-folder.interface';

const PRESIGNED_URL_CACHE_CONTROL_SAFETY_BUFFER_IN_SECONDS = 60;

export const getPresignedUrlCacheControl = ({
  presignedUrlExpiresInSeconds,
}: {
  presignedUrlExpiresInSeconds: number;
}): string => {
  const maxAgeInSeconds =
    presignedUrlExpiresInSeconds -
    PRESIGNED_URL_CACHE_CONTROL_SAFETY_BUFFER_IN_SECONDS;

  if (maxAgeInSeconds <= 0) {
    return PRESIGNED_URL_CACHE_CONTROL;
  }

  return `private, max-age=${maxAgeInSeconds}`;
};
