import { type ExecutionContext, createParamDecorator } from '@nestjs/common';

import { getRequest } from 'src/utils/extract-request';

export const AuthUserWorkspaceId = createParamDecorator(
  (_data: unknown, ctx: ExecutionContext) => {
    const request = getRequest(ctx);

    return request.userWorkspaceId;
  },
);
