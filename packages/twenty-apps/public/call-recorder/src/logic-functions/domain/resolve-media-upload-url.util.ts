import { isUndefined } from '@sniptt/guards';

import { CALL_RECORDER_MEDIA_UPLOAD_BASE_URL_ENV_VAR_NAME } from 'src/logic-functions/constants/call-recorder-media-upload-base-url-env-var-name';

export const resolveMediaUploadUrl = ({
  issuedUploadUrl,
  mediaUploadBaseUrl,
}: {
  issuedUploadUrl: string;
  mediaUploadBaseUrl: string | undefined;
}): URL => {
  const uploadUrl = new URL(issuedUploadUrl);

  if (isUndefined(mediaUploadBaseUrl)) {
    return uploadUrl;
  }

  const baseUrl = URL.canParse(mediaUploadBaseUrl)
    ? new URL(mediaUploadBaseUrl)
    : undefined;

  if (
    isUndefined(baseUrl) ||
    (baseUrl.protocol !== 'http:' && baseUrl.protocol !== 'https:')
  ) {
    throw new Error(
      `${CALL_RECORDER_MEDIA_UPLOAD_BASE_URL_ENV_VAR_NAME} must be an absolute http(s) URL, such as http://localhost:3000`,
    );
  }

  uploadUrl.protocol = baseUrl.protocol;
  uploadUrl.host = baseUrl.host;

  return uploadUrl;
};
