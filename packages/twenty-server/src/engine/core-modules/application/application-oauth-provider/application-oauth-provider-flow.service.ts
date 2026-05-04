import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { Repository } from 'typeorm';

import { ConnectedAccountProvider } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';

import { type ApplicationOAuthProviderEntity } from 'src/engine/core-modules/application/application-oauth-provider/application-oauth-provider.entity';
import { ApplicationOAuthProviderExceptionCode } from 'src/engine/core-modules/application/application-oauth-provider/application-oauth-provider-exception-code.enum';
import { ApplicationOAuthProviderException } from 'src/engine/core-modules/application/application-oauth-provider/application-oauth-provider.exception';
import { ApplicationOAuthProviderService } from 'src/engine/core-modules/application/application-oauth-provider/application-oauth-provider.service';
import { type TokenExchangeResponse } from 'src/engine/core-modules/application/application-oauth-provider/types/token-exchange-response.type';
import { buildAppOAuthCallbackUrl } from 'src/engine/core-modules/application/application-oauth-provider/utils/build-callback-url.util';
import { computePkceChallenge } from 'src/engine/core-modules/application/application-oauth-provider/utils/compute-pkce-challenge.util';
import { exchangeCodeForToken } from 'src/engine/core-modules/application/application-oauth-provider/utils/exchange-code-for-token.util';
import { generatePkceVerifier } from 'src/engine/core-modules/application/application-oauth-provider/utils/generate-pkce-verifier.util';
import {
  type AppOAuthStateJwtPayload,
  JwtTokenTypeEnum,
} from 'src/engine/core-modules/auth/types/auth-context.type';
import { JwtWrapperService } from 'src/engine/core-modules/jwt/services/jwt-wrapper.service';
import { SecureHttpClientService } from 'src/engine/core-modules/secure-http-client/secure-http-client.service';
import { TwentyConfigService } from 'src/engine/core-modules/twenty-config/twenty-config.service';
import { ConnectedAccountEntity } from 'src/engine/metadata-modules/connected-account/entities/connected-account.entity';

const STATE_JWT_EXPIRES_IN = '10m';

type AuthorizeArgs = {
  applicationOAuthProvider: ApplicationOAuthProviderEntity;
  workspaceId: string;
  userId: string;
  userWorkspaceId: string;
  // Connection-row visibility: 'user' = private to userWorkspaceId,
  // 'workspace' = shared with all members. Distinct from OAuth `scopes`
  // on the row, which are the upstream-granted permissions.
  visibility: 'user' | 'workspace';
  reconnectingConnectedAccountId: string | null;
  redirectLocation: string | null;
};

type CallbackArgs = {
  code: string;
  state: string;
};

type CallbackResult = {
  connectedAccountId: string;
  workspaceId: string;
  applicationId: string;
  redirectLocation: string | null;
};

@Injectable()
export class ApplicationOAuthProviderFlowService {
  private readonly logger = new Logger(
    ApplicationOAuthProviderFlowService.name,
  );

  constructor(
    private readonly oauthProviderService: ApplicationOAuthProviderService,
    private readonly jwtWrapperService: JwtWrapperService,
    private readonly secureHttpClientService: SecureHttpClientService,
    private readonly twentyConfigService: TwentyConfigService,
    @InjectRepository(ConnectedAccountEntity)
    private readonly connectedAccountRepository: Repository<ConnectedAccountEntity>,
  ) {}

  async startAuthorizationFlow(
    args: AuthorizeArgs,
  ): Promise<{ authorizationUrl: string }> {
    const { applicationOAuthProvider, workspaceId, userId, userWorkspaceId } =
      args;

    // Reconnect can only target a row that lives in the requesting workspace
    // *and* belongs to the same provider. Without this check, a caller could
    // pass any connectedAccount id from any workspace; persist() filters its
    // UPDATE by workspaceId so nothing would be written, but the subsequent
    // findOneByOrFail (and the redirect URL we build from it) would happily
    // surface stale fields from the foreign row. Fail fast at authorize time
    // so the user sees the error before the upstream OAuth round-trip.
    if (isDefined(args.reconnectingConnectedAccountId)) {
      const target = await this.connectedAccountRepository.findOne({
        where: {
          id: args.reconnectingConnectedAccountId,
          workspaceId,
          applicationConnectionProviderId: applicationOAuthProvider.id,
        },
      });

      if (!isDefined(target)) {
        throw new ApplicationOAuthProviderException(
          `Cannot reconnect connectedAccount ${args.reconnectingConnectedAccountId}: not found in this workspace for the requested provider.`,
          ApplicationOAuthProviderExceptionCode.FORBIDDEN,
        );
      }
    }

    const { clientId } = await this.oauthProviderService.getClientCredentials(
      applicationOAuthProvider,
    );

    const codeVerifier = applicationOAuthProvider.usePkce
      ? generatePkceVerifier()
      : null;

    const state = this.signState({
      sub: applicationOAuthProvider.id,
      type: JwtTokenTypeEnum.APP_OAUTH_STATE,
      applicationOAuthProviderId: applicationOAuthProvider.id,
      workspaceId,
      userId,
      userWorkspaceId,
      visibility: args.visibility,
      reconnectingConnectedAccountId: args.reconnectingConnectedAccountId,
      redirectLocation: args.redirectLocation,
      codeVerifier,
    });

    const callbackUrl = buildAppOAuthCallbackUrl(this.getServerUrl());

    const authorizationUrl = new URL(
      applicationOAuthProvider.authorizationEndpoint,
    );

    authorizationUrl.searchParams.set('client_id', clientId);
    authorizationUrl.searchParams.set('redirect_uri', callbackUrl);
    authorizationUrl.searchParams.set('response_type', 'code');
    authorizationUrl.searchParams.set(
      'scope',
      applicationOAuthProvider.scopes.join(' '),
    );
    authorizationUrl.searchParams.set('state', state);

    if (codeVerifier) {
      authorizationUrl.searchParams.set(
        'code_challenge',
        computePkceChallenge(codeVerifier),
      );
      authorizationUrl.searchParams.set('code_challenge_method', 'S256');
    }

    for (const [key, value] of Object.entries(
      applicationOAuthProvider.authorizationParams ?? {},
    )) {
      authorizationUrl.searchParams.set(key, value);
    }

    return { authorizationUrl: authorizationUrl.toString() };
  }

  async completeAuthorizationFlow(args: CallbackArgs): Promise<CallbackResult> {
    const statePayload = this.verifyState(args.state);

    const provider = await this.oauthProviderService.findOneByIdOrThrow(
      statePayload.applicationOAuthProviderId,
    );

    const { clientId, clientSecret } =
      await this.oauthProviderService.getClientCredentials(provider);

    const callbackUrl = buildAppOAuthCallbackUrl(this.getServerUrl());

    let tokenResponse: TokenExchangeResponse;

    try {
      tokenResponse = await exchangeCodeForToken({
        fetchFn: this.secureHttpClientService.createSsrfSafeFetch(),
        tokenEndpoint: provider.tokenEndpoint,
        clientId,
        clientSecret,
        code: args.code,
        redirectUri: callbackUrl,
        codeVerifier: statePayload.codeVerifier,
        contentType: provider.tokenRequestContentType,
      });
    } catch (error) {
      this.logger.error(
        `OAuth token exchange failed for provider ${provider.id}: ${(error as Error).message}`,
      );

      throw new ApplicationOAuthProviderException(
        (error as Error).message,
        ApplicationOAuthProviderExceptionCode.TOKEN_EXCHANGE_FAILED,
      );
    }

    const connectedAccount = await this.persistConnectedAccount({
      provider,
      tokenResponse,
      workspaceId: statePayload.workspaceId,
      userWorkspaceId: statePayload.userWorkspaceId,
      visibility: statePayload.visibility,
      reconnectingConnectedAccountId:
        statePayload.reconnectingConnectedAccountId,
    });

    return {
      connectedAccountId: connectedAccount.id,
      workspaceId: statePayload.workspaceId,
      applicationId: provider.applicationId,
      redirectLocation: statePayload.redirectLocation,
    };
  }

  private signState(payload: AppOAuthStateJwtPayload): string {
    const secret = this.jwtWrapperService.generateAppSecret(
      JwtTokenTypeEnum.APP_OAUTH_STATE,
      payload.workspaceId,
    );

    return this.jwtWrapperService.sign(payload, {
      secret,
      expiresIn: STATE_JWT_EXPIRES_IN,
    });
  }

  private verifyState(state: string): AppOAuthStateJwtPayload {
    try {
      const verified = this.jwtWrapperService.verifyJwtToken(
        state,
      ) as AppOAuthStateJwtPayload;

      if (verified.type !== JwtTokenTypeEnum.APP_OAUTH_STATE) {
        throw new Error('Wrong JWT type for OAuth state');
      }

      return verified;
    } catch (error) {
      this.logger.warn(
        `Rejected OAuth state: ${(error as Error).message ?? 'unknown reason'}`,
      );

      throw new ApplicationOAuthProviderException(
        'OAuth state signature invalid or expired',
        ApplicationOAuthProviderExceptionCode.INVALID_STATE,
      );
    }
  }

  private getServerUrl(): string {
    return this.twentyConfigService.get('SERVER_URL');
  }

  // Reconnect updates an existing row (preserves the id so logic-function
  // bindings via id keep working). New connections always create — multiple
  // credentials per (user, provider) are now allowed and intentional.
  private async persistConnectedAccount({
    provider,
    tokenResponse,
    workspaceId,
    userWorkspaceId,
    visibility,
    reconnectingConnectedAccountId,
  }: {
    provider: ApplicationOAuthProviderEntity;
    tokenResponse: TokenExchangeResponse;
    workspaceId: string;
    userWorkspaceId: string;
    visibility: 'user' | 'workspace';
    reconnectingConnectedAccountId: string | null;
  }): Promise<ConnectedAccountEntity> {
    const sharedFields = {
      accessToken: tokenResponse.accessToken,
      refreshToken: tokenResponse.refreshToken,
      scopes: tokenResponse.scopes ?? provider.scopes,
      lastCredentialsRefreshedAt: new Date(),
      authFailedAt: null,
    };

    if (isDefined(reconnectingConnectedAccountId)) {
      // Workspace-scope BOTH the update and the read — a foreign-id passed
      // through here (the authorize-time guard should have caught it) would
      // otherwise update zero rows but still return the foreign row from
      // findOneByOrFail({ id }), making a silently-failed reconnect look
      // successful.
      await this.connectedAccountRepository.update(
        { id: reconnectingConnectedAccountId, workspaceId },
        sharedFields,
      );

      return this.connectedAccountRepository.findOneByOrFail({
        id: reconnectingConnectedAccountId,
        workspaceId,
      });
    }

    const existingCount = await this.connectedAccountRepository.count({
      where: { applicationConnectionProviderId: provider.id, workspaceId },
    });

    // Auto-generated default — the user can rename from the app settings tab.
    const name = `${provider.displayName} #${existingCount + 1}`;

    const created = this.connectedAccountRepository.create({
      ...sharedFields,
      handle: name,
      name,
      visibility,
      provider: ConnectedAccountProvider.APP,
      workspaceId,
      applicationId: provider.applicationId,
      applicationConnectionProviderId: provider.id,
      userWorkspaceId,
    });

    return this.connectedAccountRepository.save(created);
  }
}
