import { type CommonPropertiesJwtPayload } from 'src/engine/core-modules/auth/types/common-properties-jwt-payload.type';
import { JwtTokenTypeEnum } from 'src/engine/core-modules/auth/types/jwt-token-type.enum';

export type ApplicationAccessTokenJwtPayload = CommonPropertiesJwtPayload & {
  type: JwtTokenTypeEnum.APPLICATION_ACCESS;
  workspaceId: string;
  applicationId: string;
  userWorkspaceId?: string;
  userId?: string;
  // narrows the token's roles to the agent's; never a caller of its own
  agentId?: string;
  workspaceDeletionRequestTimestamp?: string;
  // Only on tokens from the OAuth user grants; front components and logic functions get tokens no authorization backs
  applicationAuthorizationId?: string;
  iat?: number;
};
