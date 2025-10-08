import { type Request } from 'express';

import { type WorkspaceAuthContext } from 'src/engine/api/common/interfaces/workspace-auth-context.interface';

export type AuthenticatedRequest = Request & WorkspaceAuthContext;
