import { isDefined } from 'twenty-shared/utils';

import { APP_APPLY } from '@/app/deployment/constants/app-apply.constant';
import { CliError } from '@/output/cli-error';
import { API_URL_PROTOCOLS } from '@/target/constants/api-url-protocols.constant';
import { type ResolvedTarget } from '@/target/types/resolved-target.type';
import { fetchWithProxy } from '@/transport/fetch-with-proxy';

export const putUploadFile = async ({
  target,
  uploadUrl,
  contentType,
  bytes,
  signal,
}: {
  target: Pick<ResolvedTarget, 'apiUrl' | 'proxyHeaders'>;
  uploadUrl: string;
  contentType: string;
  bytes: Blob | Uint8Array<ArrayBuffer>;
  signal: AbortSignal;
}) => {
  const url = URL.parse(uploadUrl);

  if (!isDefined(url) || !API_URL_PROTOCOLS.includes(url.protocol)) {
    throw new CliError({
      code: 'INVALID_RESPONSE',
      message: 'The server returned an upload URL the CLI cannot use.',
    });
  }

  // Without S3 the server receives uploads on its own host, behind the same proxy.
  const proxyHeaderValues =
    isDefined(target.proxyHeaders) &&
    url.origin === new URL(target.apiUrl).origin
      ? await target.proxyHeaders.read(signal)
      : {};

  const response = await fetchWithProxy(url, {
    method: 'PUT',
    headers: { ...proxyHeaderValues, 'Content-Type': contentType },
    body: bytes,
    redirect: 'manual',
    signal: AbortSignal.any([
      signal,
      AbortSignal.timeout(APP_APPLY.UPLOAD_TIMEOUT_MILLISECONDS),
    ]),
  });

  await response.body?.cancel().catch(() => undefined);

  return response.status;
};
