import { ExecutionContext, createParamDecorator } from '@nestjs/common';

import { getRequest } from 'src/utils/extract-request';

export const AuthWorkspace = createParamDecorator(
  (_: unknown, ctx: ExecutionContext) => {
    const request = getRequest(ctx);

    return request.workspace;
  },
);
