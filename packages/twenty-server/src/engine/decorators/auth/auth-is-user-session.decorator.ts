import { type ExecutionContext, createParamDecorator } from '@nestjs/common';

import { isDefined } from 'twenty-shared/utils';

import { isUserSessionPrincipal } from 'src/engine/guards/utils/is-user-session-principal.util';
import { getRequest } from 'src/utils/extract-request';

export const AuthIsUserSession = createParamDecorator(
  (_: unknown, ctx: ExecutionContext): boolean => {
    const request = getRequest(ctx);

    if (!isDefined(request)) {
      return false;
    }

    return isUserSessionPrincipal(request);
  },
);
