import { isDefined } from 'twenty-shared/utils';

import { getHeadersFromFetchRequestArguments } from '@/remote/worker/utils/getHeadersFromFetchRequestArguments';
import { getMethodFromFetchRequestArguments } from '@/remote/worker/utils/getMethodFromFetchRequestArguments';
import { getTextBodyFromFetchRequestArguments } from '@/remote/worker/utils/getTextBodyFromFetchRequestArguments';
import { getUrlFromFetchRequestInput } from '@/remote/worker/utils/getUrlFromFetchRequestInput';
import { type HostFetchInput } from '@/types/HostFetchInput';

const URL_SEARCH_PARAMS_CONTENT_TYPE =
  'application/x-www-form-urlencoded;charset=UTF-8';

export const buildHostFetchInputFromFetchRequestArguments = async (
  input: RequestInfo | URL,
  init: RequestInit | undefined,
): Promise<HostFetchInput> => {
  const headers = getHeadersFromFetchRequestArguments(input, init);

  if (
    init?.body instanceof URLSearchParams &&
    !isDefined(headers['content-type'])
  ) {
    headers['content-type'] = URL_SEARCH_PARAMS_CONTENT_TYPE;
  }

  return {
    url: getUrlFromFetchRequestInput(input),
    method: getMethodFromFetchRequestArguments(input, init),
    headers,
    body: await getTextBodyFromFetchRequestArguments(input, init),
  };
};
