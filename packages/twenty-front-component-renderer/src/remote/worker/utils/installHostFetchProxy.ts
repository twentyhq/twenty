import { isDefined } from 'twenty-shared/utils';

import { getTextBodyFromFetchRequestArguments } from '@/remote/worker/utils/getTextBodyFromFetchRequestArguments';
import { getHeadersFromFetchRequestArguments } from '@/remote/worker/utils/getHeadersFromFetchRequestArguments';
import { getMethodFromFetchRequestArguments } from '@/remote/worker/utils/getMethodFromFetchRequestArguments';
import { getUrlFromFetchRequestInput } from '@/remote/worker/utils/getUrlFromFetchRequestInput';
import { isUrlFromProxiedOrigin } from '@/remote/worker/utils/isUrlFromProxiedOrigin';
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
    const url = getUrlFromFetchRequestInput(input);

    if (!isUrlFromProxiedOrigin(url, proxiedOrigins)) {
      return nativeFetch(input, init);
    }

    const headers = getHeadersFromFetchRequestArguments(input, init);

    if (
      init?.body instanceof URLSearchParams &&
      !isDefined(headers['content-type'])
    ) {
      headers['content-type'] = URL_SEARCH_PARAMS_CONTENT_TYPE;
    }

    const result = await hostFetch({
      url,
      method: getMethodFromFetchRequestArguments(input, init),
      headers,
      body: await getTextBodyFromFetchRequestArguments(input, init),
    });

    return new Response(result.body, {
      status: result.status,
      statusText: result.statusText,
      headers: result.headers,
    });
  };
};
