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

// Shared by the auth guards so the two cannot drift on how a credential-less
// request is reported. Returning false reports FORBIDDEN, which clients read as
// a permission problem and never recover from, so a request nothing
// authenticated has to say UNAUTHENTICATED instead. GraphQL only, since the
// catch-all filter turns a GraphQL error thrown on the REST path into a 500.
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
