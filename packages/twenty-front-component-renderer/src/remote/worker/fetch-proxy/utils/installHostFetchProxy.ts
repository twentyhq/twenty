import { buildHostFetchInputFromFetchRequestArguments } from '@/remote/worker/fetch-proxy/utils/buildHostFetchInputFromFetchRequestArguments';
import { buildResponseFromHostFetchResult } from '@/remote/worker/fetch-proxy/utils/buildResponseFromHostFetchResult';
import { getUrlFromFetchRequestInput } from '@/remote/worker/fetch-proxy/utils/getUrlFromFetchRequestInput';
import { isUrlFromProxiedOrigin } from '@/remote/worker/fetch-proxy/utils/isUrlFromProxiedOrigin';
import { type HostFetchFunction } from '@/types/HostFetchFunction';

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

    const hostFetchInput = await buildHostFetchInputFromFetchRequestArguments(
      input,
      init,
    );

    const hostFetchResult = await hostFetch(hostFetchInput);

    return buildResponseFromHostFetchResult(hostFetchResult);
  };
};
