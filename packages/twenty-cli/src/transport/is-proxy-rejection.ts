import { isDefined } from 'twenty-shared/utils';

import { getProxySignInOrigin } from '@/transport/get-proxy-sign-in-origin';

const isJsonResponse = (response: Response) =>
  /[/+]json$/i.test(
    response.headers.get('content-type')?.split(';')[0].trim() ?? '',
  );

// Twenty answers API errors in JSON, so a non-JSON 401/403 or a redirect to a
// sign-in page comes from a proxy in front of it, before Twenty saw the request.
export const isProxyRejection = (response: Response, requestUrl: URL) =>
  isDefined(getProxySignInOrigin(response, requestUrl)) ||
  ((response.status === 401 || response.status === 403) &&
    !isJsonResponse(response));
