import { isDefined } from 'twenty-shared/utils';

import { getProxiedBody } from '@/remote/worker/utils/getProxiedBody';
import { getProxiedHeaders } from '@/remote/worker/utils/getProxiedHeaders';
import { getRequestMethod } from '@/remote/worker/utils/getRequestMethod';
import { getRequestUrl } from '@/remote/worker/utils/getRequestUrl';
import { isProxiedOrigin } from '@/remote/worker/utils/isProxiedOrigin';
import { type HostFetchFunction } from '@/types/HostFetchFunction';

const URL_SEARCH_PARAMS_CONTENT_TYPE =
  'application/x-www-form-urlencoded;charset=UTF-8';

export const installHostFetchProxy = (
  hostFetch: HostFetchFunction,
  proxiedOrigins: string[],
): void => {
  const nativeFetch = globalThis.fetch.bind(globalThis);

  globalThis.fetch = async (
    input: RequestInfo | URL,
    init?: RequestInit,
  ): Promise<Response> => {
    const url = getRequestUrl(input);

    if (!isProxiedOrigin(url, proxiedOrigins)) {
      return nativeFetch(input, init);
    }

    const headers = getProxiedHeaders(input, init);

    if (
      init?.body instanceof URLSearchParams &&
      !isDefined(headers['content-type'])
    ) {
      headers['content-type'] = URL_SEARCH_PARAMS_CONTENT_TYPE;
    }

    const result = await hostFetch({
      url,
      method: getRequestMethod(input, init),
      headers,
      body: await getProxiedBody(input, init),
    });

    return new Response(result.body, {
      status: result.status,
      statusText: result.statusText,
      headers: result.headers,
    });
  };
};
