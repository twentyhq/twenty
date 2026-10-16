import { type CommonPropertiesJwtPayload } from 'src/engine/core-modules/auth/types/common-properties-jwt-payload.type';
import { JwtTokenTypeEnum } from 'src/engine/core-modules/auth/types/jwt-token-type.enum';
import { type ConnectedAccountScope } from 'src/engine/metadata-modules/connected-account/entities/connected-account.entity';

export type AppOAuthStateJwtPayload = CommonPropertiesJwtPayload & {
  type: JwtTokenTypeEnum.APP_OAUTH_STATE;
  workspaceId: string;
  connectionProviderId: string;
  userId: string;
  userWorkspaceId: string;
  scope: ConnectedAccountScope;
  // Read by previous-release servers that complete the callback mid rollout
  visibility: 'user' | 'workspace';
  // If set, the callback updates this existing connectedAccount row instead
  // of creating a new one (used by the UI's "Reconnect" action).
  reconnectingConnectedAccountId: string | null;
  redirectLocation: string | null;
  codeVerifier: string | null;
};

export type LegacyAppOAuthStateJwtPayload = Omit<
  AppOAuthStateJwtPayload,
  'scope'
>;
