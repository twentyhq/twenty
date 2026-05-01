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
import { ApplicationVariableEntityService } from 'src/engine/core-modules/application/application-variable/application-variable.service';
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
  redirectLocation: string | null;
};

type CallbackArgs = {
  code: string;
  state: string;
};

type CallbackResult = {
  connectedAccountId: string;
  workspaceId: string;
  redirectLocation: string | null;
};

@Injectable()
export class ApplicationOAuthProviderFlowService {
  private readonly logger = new Logger(
    ApplicationOAuthProviderFlowService.name,
  );

  constructor(
    private readonly oauthProviderService: ApplicationOAuthProviderService,
    private readonly applicationVariableService: ApplicationVariableEntityService,
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

    const clientId =
      await this.applicationVariableService.getRawValueByKeyOrThrow({
        applicationId: applicationOAuthProvider.applicationId,
        key: applicationOAuthProvider.clientIdVariable,
      });

    if (!clientId) {
      throw new ApplicationOAuthProviderException(
        `Client ID variable "${applicationOAuthProvider.clientIdVariable}" is empty`,
        ApplicationOAuthProviderExceptionCode.CLIENT_CREDENTIALS_NOT_CONFIGURED,
      );
    }

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

    const [clientId, clientSecret] = await Promise.all([
      this.applicationVariableService.getRawValueByKeyOrThrow({
        applicationId: provider.applicationId,
        key: provider.clientIdVariable,
      }),
      this.applicationVariableService.getRawValueByKeyOrThrow({
        applicationId: provider.applicationId,
        key: provider.clientSecretVariable,
      }),
    ]);

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

    const connectedAccount = await this.upsertConnectedAccount({
      provider,
      tokenResponse,
      workspaceId: statePayload.workspaceId,
      userWorkspaceId: statePayload.userWorkspaceId,
    });

    return {
      connectedAccountId: connectedAccount.id,
      workspaceId: statePayload.workspaceId,
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

  private async upsertConnectedAccount({
    provider,
    tokenResponse,
    workspaceId,
    userWorkspaceId,
  }: {
    provider: ApplicationOAuthProviderEntity;
    tokenResponse: TokenExchangeResponse;
    workspaceId: string;
    userWorkspaceId: string;
  }): Promise<ConnectedAccountEntity> {
    const matchByUser = provider.connectionMode === 'per-user';

    const existing = await this.connectedAccountRepository.findOne({
      where: matchByUser
        ? { applicationOAuthProviderId: provider.id, userWorkspaceId }
        : { applicationOAuthProviderId: provider.id, workspaceId },
    });

    const sharedFields = {
      accessToken: tokenResponse.accessToken,
      refreshToken: tokenResponse.refreshToken,
      scopes: tokenResponse.scopes ?? provider.scopes,
      lastCredentialsRefreshedAt: new Date(),
      authFailedAt: null,
      userWorkspaceId,
    };

    if (isDefined(existing)) {
      await this.connectedAccountRepository.update(existing.id, sharedFields);

      return this.connectedAccountRepository.findOneByOrFail({
        id: existing.id,
      });
    }

    const created = this.connectedAccountRepository.create({
      ...sharedFields,
      // handle is left empty until a future userinfo step can populate it
      // with the provider's identifier (e.g. GitHub login). Surfacing a
      // fabricated value would mislead users in the settings UI.
      handle: '',
      provider: ConnectedAccountProvider.APP,
      workspaceId,
      applicationOAuthProviderId: provider.id,
    });

    return this.connectedAccountRepository.save(created);
  }
}
