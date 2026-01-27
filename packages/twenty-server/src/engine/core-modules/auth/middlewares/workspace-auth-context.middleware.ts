import { Injectable, type NestMiddleware } from '@nestjs/common';

import { type NextFunction, type Request, type Response } from 'express';
import { isDefined } from 'twenty-shared/utils';

import { type WorkspaceAuthContext } from 'src/engine/api/common/interfaces/workspace-auth-context.interface';

import { withWorkspaceAuthContext } from 'src/engine/core-modules/auth/storage/workspace-auth-context.storage';

@Injectable()
export class WorkspaceAuthContextMiddleware implements NestMiddleware {
  use(req: Request, _res: Response, next: NextFunction) {
    if (!isDefined(req.workspace)) {
      next();

      return;
    }

    const authContext: WorkspaceAuthContext = {
      user: req.user,
      workspace: req.workspace,
      workspaceMemberId: req.workspaceMemberId,
      workspaceMember: req.workspaceMember,
      userWorkspaceId: req.userWorkspaceId,
      apiKey: req.apiKey,
      application: req.application,
    } as WorkspaceAuthContext;

    withWorkspaceAuthContext(authContext, () => {
      next();
    });
  }
}
