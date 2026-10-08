import { type ExecutionContext } from '@nestjs/common';
import { type GqlContextType } from '@nestjs/graphql';

import { msg } from '@lingui/core/macro';
import { isDefined } from 'twenty-shared/utils';

import { AuthExceptionCode } from 'src/engine/core-modules/auth/auth.exception';
import { AuthenticationError } from 'src/engine/core-modules/graphql/utils/graphql-errors.util';
import { getRequest } from 'src/utils/extract-request';

const hasAuthenticatedPrincipal = (request: {
  user?: unknown;
  apiKey?: unknown;
  application?: unknown;
}): boolean =>
  isDefined(request.user) ||
  isDefined(request.apiKey) ||
  isDefined(request.application);

// clients never recover from FORBIDDEN, so say UNAUTHENTICATED; GraphQL only, the REST catch-all would turn it into a 500
export const getRequestOrThrowWhenUnauthenticated = (
  context: ExecutionContext,
) => {
  const request = getRequest(context);

  if (!request) {
    return undefined;
  }

  if (
    !hasAuthenticatedPrincipal(request) &&
    context.getType<GqlContextType>() === 'graphql'
  ) {
    throw new AuthenticationError('Missing authentication token', {
      subCode: AuthExceptionCode.UNAUTHENTICATED,
      userFriendlyMessage: msg`You must be authenticated to perform this action.`,
    });
  }

  return request;
};
