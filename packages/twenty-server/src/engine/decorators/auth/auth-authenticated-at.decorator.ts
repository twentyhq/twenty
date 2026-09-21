import { type ExecutionContext, createParamDecorator } from '@nestjs/common';

import { getRequest } from 'src/utils/extract-request';

export const AuthAuthenticatedAt = createParamDecorator(
  (_: unknown, ctx: ExecutionContext): Date | undefined => {
    const request = getRequest(ctx);

    return request.authenticatedAt;
  },
);
