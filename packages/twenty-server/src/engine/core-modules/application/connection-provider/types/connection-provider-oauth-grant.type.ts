import { type ConnectionProviderEntity } from 'src/engine/core-modules/application/connection-provider/connection-provider.entity';
import { type TokenExchangeResponse } from 'src/engine/core-modules/application/connection-provider/types/token-exchange-response.type';
import { type PlaintextString } from 'src/engine/core-modules/secret-encryption/branded-strings/plaintext-string.type';

type OAuthGrantContext = {
  provider: ConnectionProviderEntity;
  workspaceId: string;
};

// How one OAuth provider type gets its endpoints and client; the caller owns state and persistence.
export type ConnectionProviderOAuthGrant = {
  prepareAuthorization(
    context: OAuthGrantContext,
  ): Promise<{ authorizationUrl: URL; codeVerifier: string | null }>;
  exchangeCode(
    context: OAuthGrantContext & { code: string; codeVerifier: string | null },
  ): Promise<TokenExchangeResponse>;
  refreshTokens(
    context: OAuthGrantContext & { refreshToken: PlaintextString },
  ): Promise<TokenExchangeResponse>;
};
