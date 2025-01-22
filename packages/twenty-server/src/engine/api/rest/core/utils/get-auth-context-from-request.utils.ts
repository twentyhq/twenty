import { Request } from 'express';

import { AuthContext } from 'src/engine/core-modules/auth/types/auth-context.type';
import { Workspace } from 'src/engine/core-modules/workspace/workspace.entity';

export const getAuthContextFromRequest = async (request: Request) => {
  const context: AuthContext = {
    user: request.user,
    apiKey: request.apiKey,
    workspaceMemberId: request.workspaceMemberId,
    workspace: request.workspace as Workspace,
  };

  return context;
};
