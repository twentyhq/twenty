import { User } from 'src/engine/core-modules/user/user.entity';
import { Workspace } from 'src/engine/core-modules/workspace/workspace.entity';
import { ApiKeyWorkspaceEntity } from 'src/modules/api-key/standard-objects/api-key.workspace-entity';

export type AuthContext = {
  user?: User | null | undefined;
  apiKey?: ApiKeyWorkspaceEntity | null | undefined;
  workspaceMemberId?: string;
  workspace: Workspace;
};
