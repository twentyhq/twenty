import {
  ExecutionContext,
  ForbiddenException,
  createParamDecorator,
} from '@nestjs/common';

import { getRequest } from 'src/utils/extract-request';

interface DecoratorOptions {
  required?: boolean;
}

export const AuthUser = createParamDecorator(
  (options: DecoratorOptions = { required: true }, ctx: ExecutionContext) => {
    const request = getRequest(ctx);

    if (options.required && (!request.user || !request.user.user)) {
      throw new ForbiddenException("You're not authorized to do this");
    }

    return request.user ? request.user.user : undefined;
  },
);
