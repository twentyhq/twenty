import { type APP_LOCALES } from 'twenty-shared/translations';

import { type ApiKey } from 'src/engine/core-modules/api-key/api-key.entity';
import { type ApplicationEntity } from 'src/engine/core-modules/application/application.entity';
import { type AuthContext } from 'src/engine/core-modules/auth/types/auth-context.type';
import { type UserWorkspace } from 'src/engine/core-modules/user-workspace/user-workspace.entity';
import { type User } from 'src/engine/core-modules/user/user.entity';
import { type AuthProviderEnum } from 'src/engine/core-modules/workspace/types/workspace.type';
import { type Workspace } from 'src/engine/core-modules/workspace/workspace.entity';

declare module 'express-serve-static-core' {
  interface Request {
    user?: User | null;
    apiKey?: ApiKey | null;
    application?: ApplicationEntity | null;
    userWorkspace?: UserWorkspace;
    locale: keyof typeof APP_LOCALES;
    workspace?: Workspace;
    workspaceId?: string;
    workspaceMetadataVersion?: number;
    workspaceMemberId?: string;
    workspaceMember?: WorkspaceMemberWorkspaceEntity;
    userWorkspaceId?: string;
    authProvider?: AuthProviderEnum | null;
    impersonationContext?: AuthContext['impersonationContext'];
  }
}
