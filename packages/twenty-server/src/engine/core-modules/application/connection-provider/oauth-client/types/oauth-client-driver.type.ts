import { type ConnectionProviderEntity } from 'src/engine/core-modules/application/connection-provider/connection-provider.entity';
import { type ResolvedOAuthClient } from 'src/engine/core-modules/application/connection-provider/types/resolved-oauth-client.type';

export type OAuthClientDriverArgs = {
  provider: ConnectionProviderEntity;
  workspaceId: string;
};

export type OAuthClientDriver = {
  resolveForAuthorization(
    args: OAuthClientDriverArgs,
  ): Promise<ResolvedOAuthClient>;
  resolveForTokenRequest(
    args: OAuthClientDriverArgs,
  ): Promise<ResolvedOAuthClient>;
  forgetRejectedClient(
    args: OAuthClientDriverArgs & { clientId: string },
  ): Promise<void>;
};
