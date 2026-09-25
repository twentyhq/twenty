import {
  type ExecutionContext,
  ForbiddenException,
  createParamDecorator,
} from '@nestjs/common';

import { getRequest } from 'src/utils/extract-request';

interface DecoratorOptions {
  allowUndefined?: boolean;
}

export const AuthUser = createParamDecorator(
  (options: DecoratorOptions | undefined, ctx: ExecutionContext) => {
    const request = getRequest(ctx);

    if (!options?.allowUndefined && !request.user) {
      throw new ForbiddenException(
        'This endpoint requires a token bound to a user.',
      );
    }

    return request.user;
  },
);
