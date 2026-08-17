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

// A request that presented no credential at all is never hydrated: the token
// middleware returns early so public endpoints keep working, which leaves the
// guarded ones to reject an unauthenticated request.
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

    // Rejecting by returning false reports Nest's default FORBIDDEN, which
    // clients read as a permission problem: nothing renews the credential and
    // nothing signs the user out, so a client whose credential silently lapsed
    // keeps every query failing while believing itself signed in. Restricted to
    // GraphQL because the catch-all filter turns a GraphQL error thrown on the
    // REST path into a 500; those clients keep the 403 they get today.
    if (
      !hasAuthenticatedPrincipal(request) &&
      context.getType<GqlContextType>() === 'graphql'
    ) {
      throw new AuthenticationError('Missing authentication token', {
        subCode: AuthExceptionCode.UNAUTHENTICATED,
        userFriendlyMessage: msg`You must be authenticated to perform this action.`,
      });
    }

    // Authenticated but carrying no workspace -- a workspace-agnostic token --
    // is a genuine refusal: renewing it would return the same token.
    if (!request.workspace) {
      return false;
    }

    return true;
  }
}
