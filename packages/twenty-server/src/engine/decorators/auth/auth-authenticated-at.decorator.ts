import { type ExecutionContext, createParamDecorator } from '@nestjs/common';

import { getRequest } from 'src/utils/extract-request';

// Undefined for credentials that cannot express an authentication time,
// which is every JWT: its iat is when the token was renewed, not when the
// user proved their identity.
export const AuthAuthenticatedAt = createParamDecorator(
  (_: unknown, ctx: ExecutionContext): Date | undefined => {
    const request = getRequest(ctx);

    return request.authenticatedAt;
  },
);
