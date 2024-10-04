import { User } from 'src/engine/core-modules/user/user.entity';
import { Workspace } from 'src/engine/core-modules/workspace/workspace.entity';
import { ApiKeyWorkspaceEntity } from 'src/modules/api-key/standard-objects/api-key.workspace-entity';

declare module 'express-serve-static-core' {
  interface Request {
    user?: User | null;
    apiKey?: ApiKeyWorkspaceEntity | null;
    workspace?: Workspace;
    workspaceId?: string;
    workspaceMetadataVersion?: number;
    workspaceMemberId?: string;
  }
}
