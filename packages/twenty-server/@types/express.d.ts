import { type APP_LOCALES } from 'twenty-shared/translations';

import { type FlatApiKey } from 'src/engine/core-modules/api-key/types/flat-api-key.type';
import { type ApplicationEntity } from 'src/engine/core-modules/application/application.entity';
import { type RawAuthContext } from 'src/engine/core-modules/auth/types/auth-context.type';
import { type FlatAuthContextUser } from 'src/engine/core-modules/auth/types/flat-auth-context-user.type';
import { type FlatUserWorkspace } from 'src/engine/core-modules/user-workspace/types/flat-user-workspace.type';
import { type FlatWorkspace } from 'src/engine/core-modules/workspace/types/flat-workspace.type';
import { type AuthProviderEnum } from 'src/engine/core-modules/workspace/types/workspace.type';
import { type WorkspaceMemberWorkspaceEntity } from 'src/modules/workspace-member/standard-objects/workspace-member.workspace-entity';

declare module 'express-serve-static-core' {
  interface Request {
    user?: FlatAuthContextUser | null;
    apiKey?: FlatApiKey | null;
    application?: ApplicationEntity | null;
    userWorkspace?: FlatUserWorkspace;
    locale: keyof typeof APP_LOCALES;
    workspace?: FlatWorkspace;
    workspaceId?: string;
    workspaceMetadataVersion?: number;
    workspaceMemberId?: string;
    workspaceMember?: WorkspaceMemberWorkspaceEntity;
    userWorkspaceId?: string;
    authProvider?: AuthProviderEnum | null;
    impersonationContext?: RawAuthContext['impersonationContext'];
  }
}
