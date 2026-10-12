import { type CommonPropertiesJwtPayload } from 'src/engine/core-modules/auth/types/common-properties-jwt-payload.type';
import { JwtTokenTypeEnum } from 'src/engine/core-modules/auth/types/jwt-token-type.enum';

export type AppOAuthStateJwtPayload = CommonPropertiesJwtPayload & {
  type: JwtTokenTypeEnum.APP_OAUTH_STATE;
  // Keys the single-use server-side entry holding the PKCE verifier, and is
  // echoed by the browser-binding cookie.
  jti: string;
  workspaceId: string;
  connectionProviderId: string;
  userId: string;
  userWorkspaceId: string;
  // 'user' scopes the credential to userWorkspaceId; 'workspace' makes it
  // visible to anyone in the workspace.
  visibility: 'user' | 'workspace';
  // If set, the callback updates this existing connectedAccount row instead
  // of creating a new one (used by the UI's "Reconnect" action).
  reconnectingConnectedAccountId: string | null;
  redirectLocation: string | null;
};
