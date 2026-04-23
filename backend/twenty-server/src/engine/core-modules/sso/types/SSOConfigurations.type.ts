import { type WorkspaceEntity } from 'src/engine/core-modules/workspace/workspace.entity';

import { type IdentityProviderType, type SSOIdentityProviderStatus } from '../workspace-sso-identity-provider.entity';

export type SSOConfiguration = {
  id: string;
  type: IdentityProviderType;
  status: SSOIdentityProviderStatus;
  workspaceId?: string;
  workspace?: WorkspaceEntity;
  issuer: string;
  ssoURL?: string;
  entryPointUrl?: string;
  callbackUrl?: string;
  authorizationUrl?: string;
  tokenUrl?: string;
  clientId?: string;
  clientSecret?: string;
  scope?: string;
  certificate?: string;
};
