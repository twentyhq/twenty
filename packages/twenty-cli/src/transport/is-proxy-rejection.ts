import { isDefined } from 'twenty-shared/utils';

import { getProxySignInOrigin } from '@/transport/get-proxy-sign-in-origin';

const isJsonResponse = (response: Response) =>
  /[/+]json$/i.test(
    response.headers.get('content-type')?.split(';')[0].trim() ?? '',
  );

// Twenty's API errors are JSON, so these responses come from a proxy in front of it.
export const isProxyRejection = ({
  response,
  requestUrl,
}: {
  response: Response;
  requestUrl: URL;
}) =>
  isDefined(getProxySignInOrigin({ response, requestUrl })) ||
  ((response.status === 401 || response.status === 403) &&
    !isJsonResponse(response));
