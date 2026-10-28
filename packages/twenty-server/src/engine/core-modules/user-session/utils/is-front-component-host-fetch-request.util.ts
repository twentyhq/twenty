import { type Request } from 'express';

import { FRONT_COMPONENT_HOST_FETCH_HEADER_NAME } from 'twenty-shared/constants';
import { isDefined } from 'twenty-shared/utils';

// The host page forwards cookies for front components so auth proxies accept them; their code must not ride the user's session.
export const isFrontComponentHostFetchRequest = (request: Request): boolean =>
  isDefined(request.headers[FRONT_COMPONENT_HOST_FETCH_HEADER_NAME]);
