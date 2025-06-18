import { ExecutionContext, createParamDecorator } from '@nestjs/common';

import { getRequest } from 'src/utils/extract-request';

export const Host = createParamDecorator(
  (data: unknown, ctx: ExecutionContext) => {
    const request = getRequest(ctx);

    return request.headers?.host || request.get?.('host');
  },
);
