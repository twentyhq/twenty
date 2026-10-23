import { type ExecutionContext, createParamDecorator } from '@nestjs/common';

import { isDefined } from 'twenty-shared/utils';

import { type AuthPrincipalVariant } from 'src/engine/guards/types/auth-principal-variant.type';
import { classifyAuthPrincipal } from 'src/engine/guards/utils/classify-auth-principal.util';
import { getRequest } from 'src/utils/extract-request';

export const AuthPrincipal = createParamDecorator(
  (_: unknown, ctx: ExecutionContext): AuthPrincipalVariant | undefined => {
    const request = getRequest(ctx);

    return isDefined(request) ? classifyAuthPrincipal(request) : undefined;
  },
);
