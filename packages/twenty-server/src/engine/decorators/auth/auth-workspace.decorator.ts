import {
  type ExecutionContext,
  InternalServerErrorException,
  createParamDecorator,
} from '@nestjs/common';

import { getRequest } from 'src/utils/extract-request';

interface DecoratorOptions {
  allowUndefined?: boolean;
}

export const AuthWorkspace = createParamDecorator(
  (options: DecoratorOptions | undefined, ctx: ExecutionContext) => {
    const request = getRequest(ctx);

    if (!options?.allowUndefined && !request.workspace) {
      // We're throwing an internal error and not a ForbiddenException
      // because this should never happen, this is an extra security measure
      // but Auth should be handled through the guards not the decorator
      throw new InternalServerErrorException(
        "You're not authorized to do this. This should not ever happen.",
      );
    }

    return request.workspace;
  },
);
