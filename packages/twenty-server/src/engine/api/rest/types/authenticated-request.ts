import { type Request } from 'express';

import { type WorkspaceAuthContext } from 'src/engine/core-modules/auth/types/workspace-auth-context.type';

export type AuthenticatedRequest = Request & WorkspaceAuthContext;
