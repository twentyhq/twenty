import {
  type CanActivate,
  type ExecutionContext,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { GqlExecutionContext } from '@nestjs/graphql';

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
      throw new ForbiddenException(
        "Can't access this resource while impersonating",
      );
    }

    return true;
  }
}
