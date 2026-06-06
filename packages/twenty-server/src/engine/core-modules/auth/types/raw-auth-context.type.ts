import { type FlatApiKey } from 'src/engine/core-modules/api-key/types/flat-api-key.type';
import { type FlatApplication } from 'src/engine/core-modules/application/types/flat-application.type';
import { type FlatAuthContextUser } from 'src/engine/core-modules/auth/types/flat-auth-context-user.type';
import { type JwtTokenTypeEnum } from 'src/engine/core-modules/auth/types/jwt-token-type.enum';
import { type FlatUserWorkspace } from 'src/engine/core-modules/user-workspace/types/flat-user-workspace.type';
import { type FlatWorkspace } from 'src/engine/core-modules/workspace/types/flat-workspace.type';
import { type AuthProviderEnum } from 'src/engine/core-modules/workspace/types/workspace.type';
import { type WorkspaceMemberWorkspaceEntity } from 'src/modules/workspace-member/standard-objects/workspace-member.workspace-entity';

export type RawAuthContext = {
  user?: FlatAuthContextUser | null | undefined;
  apiKey?: FlatApiKey | null | undefined;
  workspaceMemberId?: string;
  workspaceMember?: WorkspaceMemberWorkspaceEntity;
  workspace?: FlatWorkspace;
  application?: FlatApplication | null | undefined;
  userWorkspaceId?: string;
  userWorkspace?: FlatUserWorkspace;
  authProvider?: AuthProviderEnum;
  impersonationContext?: {
    impersonatorUserWorkspaceId?: string;
    impersonatedUserWorkspaceId?: string;
  };
  tokenType?: JwtTokenTypeEnum;
};
