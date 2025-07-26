import { APP_LOCALES } from 'twenty-shared/translations';

import { ApiKey } from 'src/engine/core-modules/api-key/api-key.entity';
import { UserWorkspace } from 'src/engine/core-modules/user-workspace/user-workspace.entity';
import { User } from 'src/engine/core-modules/user/user.entity';
import { AuthProviderEnum } from 'src/engine/core-modules/workspace/types/workspace.type';
import { Workspace } from 'src/engine/core-modules/workspace/workspace.entity';

declare module 'express-serve-static-core' {
  interface Request {
    user?: User | null;
    apiKey?: ApiKey | null;
    userWorkspace?: UserWorkspace;
    locale: keyof typeof APP_LOCALES;
    workspace?: Workspace;
    workspaceId?: string;
    workspaceMetadataVersion?: number;
    workspaceMemberId?: string;
    userWorkspaceId?: string;
    authProvider?: AuthProviderEnum | null;
  }
}
