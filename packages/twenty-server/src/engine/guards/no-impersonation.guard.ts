import {
  type CanActivate,
  type ExecutionContext,
  Injectable,
} from '@nestjs/common';
import { GqlExecutionContext } from '@nestjs/graphql';

import { msg } from '@lingui/core/macro';

import { ForbiddenError } from 'src/engine/core-modules/graphql/utils/graphql-errors.util';

@Injectable()
export class NoImpersonationGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const ctx = GqlExecutionContext.create(context);
    const request = ctx.getContext().req as {
      impersonationContext?: {
        impersonatorUserWorkspaceId?: string;
        impersonatedUserWorkspaceId?: string;
      };
    };

    const isCurrentlyImpersonating = Boolean(
      request?.impersonationContext?.impersonatorUserWorkspaceId &&
      request?.impersonationContext?.impersonatedUserWorkspaceId,
    );

    if (isCurrentlyImpersonating) {
      throw new ForbiddenError(
        "Can't access this resource while impersonating",
        {
          userFriendlyMessage: msg`You can't do this while impersonating another user.`,
        },
      );
    }

    return true;
  }
}
