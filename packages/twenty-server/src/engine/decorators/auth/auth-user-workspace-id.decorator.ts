import {
  type ExecutionContext,
  ForbiddenException,
  createParamDecorator,
} from '@nestjs/common';

import { getRequest } from 'src/utils/extract-request';

interface DecoratorOptions {
  allowUndefined?: boolean;
}

export const AuthUserWorkspaceId = createParamDecorator(
  (options: DecoratorOptions | undefined, ctx: ExecutionContext) => {
    const request = getRequest(ctx);

    if (!options?.allowUndefined && !request.userWorkspaceId) {
      throw new ForbiddenException(
        'This endpoint requires a token bound to a user workspace.',
      );
    }

    return request.userWorkspaceId;
  },
);
