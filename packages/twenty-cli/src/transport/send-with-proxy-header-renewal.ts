import { isDefined } from 'twenty-shared/utils';

import { type ProxyHeaders } from '@/proxy-headers/types/proxy-headers.type';
import { isProxyRejection } from '@/transport/is-proxy-rejection';

export const sendWithProxyHeaderRenewal = async ({
  proxyHeaders,
  requestUrl,
  canReplay,
  signal,
  send,
}: {
  proxyHeaders: ProxyHeaders | undefined;
  requestUrl: URL;
  canReplay: boolean;
  signal: AbortSignal;
  send: (proxyHeaderValues: Record<string, string>) => Promise<Response>;
}) => {
  // Stays synchronous without proxy headers so an immediate abort reaches fetch.
  const proxyHeaderValues = isDefined(proxyHeaders)
    ? await proxyHeaders.read(signal)
    : {};
  const response = await send(proxyHeaderValues);

  if (
    !proxyHeaders?.isRenewable ||
    !canReplay ||
    !isProxyRejection({ response, requestUrl })
  ) {
    return response;
  }

  // Safe to replay: the proxy rejected it before Twenty saw it.
  await response.body?.cancel();
  proxyHeaders.renew(proxyHeaderValues);

  return send(await proxyHeaders.read(signal));
};
