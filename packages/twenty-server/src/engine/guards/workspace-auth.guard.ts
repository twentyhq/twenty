import {
  type CanActivate,
  type ExecutionContext,
  Injectable,
} from '@nestjs/common';

import { type GqlContextType } from '@nestjs/graphql';

import { msg } from '@lingui/core/macro';
import { type Observable } from 'rxjs';
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

@Injectable()
export class WorkspaceAuthGuard implements CanActivate {
  canActivate(
    context: ExecutionContext,
  ): boolean | Promise<boolean> | Observable<boolean> {
    const request = getRequest(context);

    if (!request) {
      return false;
    }

    // Returning false here would report FORBIDDEN, which clients read as a
    // permission problem and never recover from. GraphQL only: the catch-all
    // filter turns a GraphQL error thrown on the REST path into a 500.
    if (
      !hasAuthenticatedPrincipal(request) &&
      context.getType<GqlContextType>() === 'graphql'
    ) {
      throw new AuthenticationError('Missing authentication token', {
        subCode: AuthExceptionCode.UNAUTHENTICATED,
        userFriendlyMessage: msg`You must be authenticated to perform this action.`,
      });
    }

    // Workspace-agnostic token: a genuine refusal, renewing returns the same one.
    if (!request.workspace) {
      return false;
    }

    return true;
  }
}
