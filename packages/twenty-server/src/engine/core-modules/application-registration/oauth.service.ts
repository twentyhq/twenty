import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import crypto from 'crypto';

import ms from 'ms';
import { IsNull, Repository } from 'typeorm';
import { base64UrlEncode } from 'twenty-shared/utils';

import {
  AppTokenEntity,
  AppTokenType,
} from 'src/engine/core-modules/app-token/app-token.entity';
import { ApplicationRegistrationEntity } from 'src/engine/core-modules/application-registration/application-registration.entity';
import { ApplicationRegistrationService } from 'src/engine/core-modules/application-registration/application-registration.service';
import { ApplicationEntity } from 'src/engine/core-modules/application/application.entity';
import { ApplicationService } from 'src/engine/core-modules/application/services/application.service';
import { OAuthErrorResponse } from 'src/engine/core-modules/application-registration/types/oauth-error-response.type';
import { OAuthTokenResponse } from 'src/engine/core-modules/application-registration/types/oauth-token-response.type';
import { ApplicationTokenService } from 'src/engine/core-modules/auth/token/services/application-token.service';
import { TwentyConfigService } from 'src/engine/core-modules/twenty-config/twenty-config.service';
import { UserWorkspaceEntity } from 'src/engine/core-modules/user-workspace/user-workspace.entity';

@Injectable()
export class OAuthService {
  private readonly logger = new Logger(OAuthService.name);

  constructor(
    @InjectRepository(AppTokenEntity)
    private readonly appTokenRepository: Repository<AppTokenEntity>,
    @InjectRepository(ApplicationEntity)
    private readonly applicationRepository: Repository<ApplicationEntity>,
    @InjectRepository(UserWorkspaceEntity)
    private readonly userWorkspaceRepository: Repository<UserWorkspaceEntity>,
    private readonly applicationTokenService: ApplicationTokenService,
    private readonly applicationRegistrationService: ApplicationRegistrationService,
    private readonly applicationService: ApplicationService,
    private readonly twentyConfigService: TwentyConfigService,
  ) {}

  async exchangeAuthorizationCode(params: {
    authorizationCode: string;
    clientId: string;
    clientSecret?: string;
    codeVerifier?: string;
    redirectUri: string;
  }): Promise<OAuthTokenResponse | OAuthErrorResponse> {
    const {
      authorizationCode,
      clientId,
      clientSecret,
      codeVerifier,
      redirectUri,
    } = params;

    if (!authorizationCode) {
      return this.errorResponse(
        'invalid_request',
        'Authorization code is required',
      );
    }

    const clientValidation = await this.validateClient(clientId);

    if ('error' in clientValidation) {
      return clientValidation;
    }

    const applicationRegistration = clientValidation;

    if (clientSecret) {
      const secretError = await this.validateClientSecret(
        applicationRegistration,
        clientSecret,
      );

      if (secretError) {
        return secretError;
      }
    }

    const authCodeToken = await this.appTokenRepository.findOne({
      where: {
        value: authorizationCode,
        type: AppTokenType.AuthorizationCode,
        revokedAt: IsNull(),
      },
    });

    if (!authCodeToken) {
      return this.errorResponse(
        'invalid_grant',
        'Authorization code not found',
      );
    }

    if (authCodeToken.expiresAt.getTime() < Date.now()) {
      return this.errorResponse('invalid_grant', 'Authorization code expired');
    }

    // RFC 6749 §4.1.3: redirect_uri must match the one used in the authorization request
    const storedRedirectUri = authCodeToken.context?.redirectUri;

    if (storedRedirectUri) {
      if (!redirectUri) {
        return this.errorResponse(
          'invalid_request',
          'redirect_uri is required',
        );
      }

      if (redirectUri !== storedRedirectUri) {
        return this.errorResponse(
          'invalid_grant',
          'redirect_uri does not match the one used in the authorization request',
        );
      }
    }

    if (codeVerifier) {
      const pkceError = await this.validatePkce(codeVerifier, authCodeToken);

      if (pkceError) {
        return pkceError;
      }
    }

    if (!clientSecret && !codeVerifier) {
      return this.errorResponse(
        'invalid_request',
        'Either client_secret or code_verifier (PKCE) is required',
      );
    }

    await this.appTokenRepository.update(authCodeToken.id, {
      revokedAt: new Date(),
    });

    if (!authCodeToken.userId || !authCodeToken.workspaceId) {
      return this.errorResponse(
        'server_error',
        'Authorization code is missing user or workspace context',
      );
    }

    const application = await this.findOrInstallApplication(
      applicationRegistration,
      authCodeToken.workspaceId,
    );

    const userWorkspace = await this.userWorkspaceRepository.findOne({
      where: {
        userId: authCodeToken.userId,
        workspaceId: authCodeToken.workspaceId,
      },
    });

    const { applicationAccessToken, applicationRefreshToken } =
      await this.applicationTokenService.generateApplicationTokenPair({
        workspaceId: authCodeToken.workspaceId,
        applicationId: application.id,
        userId: authCodeToken.userId,
        userWorkspaceId: userWorkspace?.id,
      });

    return {
      access_token: applicationAccessToken.token,
      token_type: 'Bearer',
      expires_in: this.getAccessTokenExpiresInSeconds(),
      refresh_token: applicationRefreshToken.token,
      scope: applicationRegistration.oAuthScopes.join(' '),
    };
  }

  async clientCredentialsGrant(params: {
    clientId: string;
    clientSecret: string;
  }): Promise<OAuthTokenResponse | OAuthErrorResponse> {
    const { clientId, clientSecret } = params;

    const clientValidation = await this.validateClient(clientId);

    if ('error' in clientValidation) {
      return clientValidation;
    }

    const applicationRegistration = clientValidation;

    const secretError = await this.validateClientSecret(
      applicationRegistration,
      clientSecret,
    );

    if (secretError) {
      return secretError;
    }

    const applications = await this.applicationRepository.find({
      where: { applicationRegistrationId: applicationRegistration.id },
    });

    if (applications.length === 0) {
      return this.errorResponse(
        'server_error',
        'No workspace installation found for this client. Install the app in a workspace first.',
      );
    }

    if (applications.length > 1) {
      return this.errorResponse(
        'invalid_request',
        'Multiple workspace installations found. Client credentials grant requires exactly one installation.',
      );
    }

    const application = applications[0];

    const applicationAccessToken =
      await this.applicationTokenService.generateApplicationAccessToken({
        workspaceId: application.workspaceId,
        applicationId: application.id,
      });

    return {
      access_token: applicationAccessToken.token,
      token_type: 'Bearer',
      expires_in: this.getAccessTokenExpiresInSeconds(),
      scope: applicationRegistration.oAuthScopes.join(' '),
    };
  }

  async refreshTokenGrant(params: {
    refreshToken: string;
    clientId: string;
    clientSecret?: string;
  }): Promise<OAuthTokenResponse | OAuthErrorResponse> {
    const { refreshToken, clientId, clientSecret } = params;

    const clientValidation = await this.validateClient(clientId);

    if ('error' in clientValidation) {
      return clientValidation;
    }

    const applicationRegistration = clientValidation;

    if (clientSecret) {
      const secretError = await this.validateClientSecret(
        applicationRegistration,
        clientSecret,
      );

      if (secretError) {
        return secretError;
      }
    }

    try {
      const payload =
        this.applicationTokenService.validateApplicationRefreshToken(
          refreshToken,
        );

      const { applicationAccessToken, applicationRefreshToken } =
        await this.applicationTokenService.renewApplicationTokens(payload);

      return {
        access_token: applicationAccessToken.token,
        token_type: 'Bearer',
        expires_in: this.getAccessTokenExpiresInSeconds(),
        refresh_token: applicationRefreshToken.token,
        scope: applicationRegistration.oAuthScopes.join(' '),
      };
    } catch (error) {
      this.logger.error('Refresh token grant failed', error);

      return this.errorResponse(
        'invalid_grant',
        'Invalid or expired refresh token',
      );
    }
  }

  private async validateClient(
    clientId: string,
  ): Promise<ApplicationRegistrationEntity | OAuthErrorResponse> {
    const applicationRegistration =
      await this.applicationRegistrationService.findOneByClientId(clientId);

    if (!applicationRegistration) {
      return this.errorResponse('invalid_client', 'Client not found');
    }

    return applicationRegistration;
  }

  private async validateClientSecret(
    applicationRegistration: ApplicationRegistrationEntity,
    clientSecret: string,
  ): Promise<OAuthErrorResponse | null> {
    const isValid =
      await this.applicationRegistrationService.verifyClientSecret(
        applicationRegistration,
        clientSecret,
      );

    if (!isValid) {
      return this.errorResponse('invalid_client', 'Invalid client secret');
    }

    return null;
  }

  private async validatePkce(
    codeVerifier: string,
    authCodeToken: AppTokenEntity,
  ): Promise<OAuthErrorResponse | null> {
    const codeChallenge = base64UrlEncode(
      crypto.createHash('sha256').update(codeVerifier).digest(),
    );

    const challengeToken = await this.appTokenRepository.findOne({
      where: {
        value: codeChallenge,
        type: AppTokenType.CodeChallenge,
        revokedAt: IsNull(),
        ...(authCodeToken.userId ? { userId: authCodeToken.userId } : {}),
      },
    });

    if (!challengeToken) {
      return this.errorResponse(
        'invalid_grant',
        'Code verifier does not match the code challenge',
      );
    }

    if (challengeToken.expiresAt.getTime() < Date.now()) {
      return this.errorResponse('invalid_grant', 'Code challenge expired');
    }

    await this.appTokenRepository.update(challengeToken.id, {
      revokedAt: new Date(),
    });

    return null;
  }

  private async findOrInstallApplication(
    applicationRegistration: ApplicationRegistrationEntity,
    workspaceId: string,
  ): Promise<ApplicationEntity> {
    const existingApplication = await this.applicationRepository.findOne({
      where: {
        applicationRegistrationId: applicationRegistration.id,
        workspaceId,
      },
    });

    if (existingApplication) {
      return existingApplication;
    }

    this.logger.log(
      `Auto-installing application "${applicationRegistration.name}" in workspace ${workspaceId}`,
    );

    // TODO: defaulting to version 0.0.0, build better system
    return this.applicationService.create({
      universalIdentifier: applicationRegistration.universalIdentifier,
      name: applicationRegistration.name,
      description: applicationRegistration.description,
      version: '0.0.0',
      sourcePath: 'oauth-install',
      applicationRegistrationId: applicationRegistration.id,
      workspaceId,
    });
  }

  // OAuth RFC 6749 requires expires_in as seconds
  private getAccessTokenExpiresInSeconds(): number {
    const duration = this.twentyConfigService.get(
      'APPLICATION_ACCESS_TOKEN_EXPIRES_IN',
    );

    return Math.floor(ms(duration) / 1000);
  }

  private errorResponse(
    error: string,
    errorDescription: string,
  ): OAuthErrorResponse {
    return { error, error_description: errorDescription };
  }
}
