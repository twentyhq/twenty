import { createParamDecorator, ExecutionContext } from '@nestjs/common';

import { getRequest } from 'src/utils/extract-request';

export const AuthApiKey = createParamDecorator(
  (data: unknown, ctx: ExecutionContext) => {
    const request = getRequest(ctx);

    return request.apiKey;
  },
);
