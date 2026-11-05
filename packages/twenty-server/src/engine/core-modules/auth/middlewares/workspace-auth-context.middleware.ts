import { Injectable, type NestMiddleware } from '@nestjs/common';

import { type NextFunction, type Response } from 'express';
import { isDefined } from 'twenty-shared/utils';

import { withWorkspaceAuthContext } from 'src/engine/core-modules/auth/storage/workspace-auth-context.storage';
import {
  buildWorkspaceAuthContextFromRequest,
  type WorkspaceAuthContextRequest,
} from 'src/engine/core-modules/auth/utils/build-workspace-auth-context-from-request.util';
import { applyWorkspaceSentryContext } from 'src/engine/core-modules/sentry/utils/apply-workspace-sentry-context.util';

@Injectable()
export class WorkspaceAuthContextMiddleware implements NestMiddleware {
  use(req: WorkspaceAuthContextRequest, _res: Response, next: NextFunction) {
    if (!isDefined(req.workspace)) {
      next();

      return;
    }

    const authContext = buildWorkspaceAuthContextFromRequest(req);

    applyWorkspaceSentryContext(authContext);

    void withWorkspaceAuthContext(authContext, () => {
      next();
    });
  }
}
