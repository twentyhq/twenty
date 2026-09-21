import { type ExecutionContext, createParamDecorator } from '@nestjs/common';

import { getRequest } from 'src/utils/extract-request';

export const AuthImpersonationContext = createParamDecorator(
  (_: unknown, ctx: ExecutionContext) => {
    const request = getRequest(ctx);

    return request.impersonationContext;
  },
);
