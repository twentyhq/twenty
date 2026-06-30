import { type CommonPropertiesJwtPayload } from 'src/engine/core-modules/auth/types/common-properties-jwt-payload.type';
import { JwtTokenTypeEnum } from 'src/engine/core-modules/auth/types/jwt-token-type.enum';
import { type AuthProviderEnum } from 'src/engine/core-modules/workspace/types/workspace.type';

export type WorkspaceAgnosticTokenJwtPayload = CommonPropertiesJwtPayload & {
  type: JwtTokenTypeEnum.WORKSPACE_AGNOSTIC;
  userId: string;
  authProvider: AuthProviderEnum;
};
