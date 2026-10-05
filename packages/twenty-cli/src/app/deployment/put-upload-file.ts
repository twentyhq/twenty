import { isDefined } from 'twenty-shared/utils';

import { APP_APPLY } from '@/app/deployment/constants/app-apply.constant';
import { CliError } from '@/output/cli-error';
import { API_URL_PROTOCOLS } from '@/target/constants/api-url-protocols.constant';
import { fetchWithProxy } from '@/transport/fetch-with-proxy';

export const putUploadFile = async ({
  uploadUrl,
  contentType,
  bytes,
  signal,
}: {
  uploadUrl: string;
  contentType: string;
  bytes: Uint8Array<ArrayBuffer>;
  signal: AbortSignal;
}) => {
  const url = URL.parse(uploadUrl);

  if (!isDefined(url) || !API_URL_PROTOCOLS.includes(url.protocol)) {
    throw new CliError({
      code: 'INVALID_RESPONSE',
      message: 'The server returned an upload URL the CLI cannot use.',
    });
  }

  const response = await fetchWithProxy(url, {
    method: 'PUT',
    headers: { 'Content-Type': contentType },
    body: bytes,
    redirect: 'manual',
    signal: AbortSignal.any([
      signal,
      AbortSignal.timeout(APP_APPLY.UPLOAD_TIMEOUT_MILLISECONDS),
    ]),
  });

  await response.body?.cancel();

  return response.status;
};
