import { Injectable, type NestMiddleware } from '@nestjs/common';

import { type NextFunction, type Request, type Response } from 'express';
import { isDefined } from 'twenty-shared/utils';

import {
  AuthException,
  AuthExceptionCode,
} from 'src/engine/core-modules/auth/auth.exception';
import { withWorkspaceAuthContext } from 'src/engine/core-modules/auth/storage/workspace-auth-context.storage';
import { type WorkspaceAuthContext } from 'src/engine/core-modules/auth/types/workspace-auth-context.type';
import { buildWorkspaceAuthContext } from 'src/engine/core-modules/auth/utils/build-workspace-auth-context.util';
import { applyWorkspaceSentryContext } from 'src/engine/core-modules/sentry/utils/apply-workspace-sentry-context.util';

@Injectable()
export class WorkspaceAuthContextMiddleware implements NestMiddleware {
  use(req: Request, _res: Response, next: NextFunction) {
    if (!isDefined(req.workspace)) {
      next();

      return;
    }

    const authContext = this.buildAuthContext(req);

    applyWorkspaceSentryContext(authContext);

    void withWorkspaceAuthContext(authContext, () => {
      next();
    });
  }

  private buildAuthContext(req: Request): WorkspaceAuthContext {
    const authContext = buildWorkspaceAuthContext({
      workspace: req.workspace,
      apiKey: req.apiKey,
      userWorkspaceId: req.userWorkspaceId,
      workspaceMemberId: req.workspaceMemberId,
      workspaceMember: req.workspaceMember,
      user: req.user,
      application: req.application,
    });

    if (!isDefined(authContext)) {
      throw new AuthException(
        'No authentication context found',
        AuthExceptionCode.UNAUTHENTICATED,
      );
    }

    return authContext;
  }
}
