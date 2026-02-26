import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import crypto from 'crypto';

import { Repository } from 'typeorm';

import { AppRegistrationEntity } from 'src/engine/core-modules/app-registration/app-registration.entity';
import { AppRegistrationService } from 'src/engine/core-modules/app-registration/app-registration.service';
import {
  AppTokenEntity,
  AppTokenType,
} from 'src/engine/core-modules/app-token/app-token.entity';
import { ApplicationEntity } from 'src/engine/core-modules/application/application.entity';
import { ApplicationTokenService } from 'src/engine/core-modules/auth/token/services/application-token.service';
import { UserWorkspaceEntity } from 'src/engine/core-modules/user-workspace/user-workspace.entity';

const OAUTH_ACCESS_TOKEN_EXPIRES_IN = 1800;

type OAuthTokenResponse = {
  access_token: string;
  token_type: string;
  expires_in: number;
  refresh_token?: string;
  scope?: string;
};

type OAuthErrorResponse = {
  error: string;
  error_description: string;
};

@Injectable()
export class OAuthService {
  constructor(
    @InjectRepository(AppTokenEntity)
    private readonly appTokenRepository: Repository<AppTokenEntity>,
    @InjectRepository(ApplicationEntity)
    private readonly applicationRepository: Repository<ApplicationEntity>,
    @InjectRepository(UserWorkspaceEntity)
    private readonly userWorkspaceRepository: Repository<UserWorkspaceEntity>,
    private readonly applicationTokenService: ApplicationTokenService,
    private readonly appRegistrationService: AppRegistrationService,
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

    const appRegistration = clientValidation;

    if (
      redirectUri &&
      appRegistration.redirectUris.length > 0 &&
      !appRegistration.redirectUris.includes(redirectUri)
    ) {
      return this.errorResponse(
        'invalid_grant',
        'Redirect URI does not match any registered redirect URI',
      );
    }

    if (clientSecret) {
      const secretError = await this.validateClientSecret(
        appRegistration,
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
      },
    });

    if (!authCodeToken) {
      return this.errorResponse(
        'invalid_grant',
        'Authorization code not found',
      );
    }

    if (authCodeToken.expiresAt.getTime() < Date.now()) {
      return this.errorResponse(
        'invalid_grant',
        'Authorization code expired',
      );
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

    const application = await this.findApplicationByRegistrationAndWorkspace(
      appRegistration.id,
      authCodeToken.workspaceId,
    );

    if (!application) {
      return this.errorResponse(
        'server_error',
        'No workspace installation found for this client',
      );
    }

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
      expires_in: OAUTH_ACCESS_TOKEN_EXPIRES_IN,
      refresh_token: applicationRefreshToken.token,
      scope: appRegistration.scopes.join(' '),
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

    const appRegistration = clientValidation;

    const secretError = await this.validateClientSecret(
      appRegistration,
      clientSecret,
    );

    if (secretError) {
      return secretError;
    }

    const application = await this.applicationRepository.findOne({
      where: { appRegistrationId: appRegistration.id },
    });

    if (!application) {
      return this.errorResponse(
        'server_error',
        'No workspace installation found for this client. Install the app in a workspace first.',
      );
    }

    const applicationAccessToken =
      await this.applicationTokenService.generateApplicationAccessToken({
        workspaceId: application.workspaceId,
        applicationId: application.id,
      });

    return {
      access_token: applicationAccessToken.token,
      token_type: 'Bearer',
      expires_in: OAUTH_ACCESS_TOKEN_EXPIRES_IN,
      scope: appRegistration.scopes.join(' '),
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

    const appRegistration = clientValidation;

    if (clientSecret) {
      const secretError = await this.validateClientSecret(
        appRegistration,
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
        expires_in: OAUTH_ACCESS_TOKEN_EXPIRES_IN,
        refresh_token: applicationRefreshToken.token,
        scope: appRegistration.scopes.join(' '),
      };
    } catch {
      return this.errorResponse(
        'invalid_grant',
        'Invalid or expired refresh token',
      );
    }
  }

  private async validateClient(
    clientId: string,
  ): Promise<AppRegistrationEntity | OAuthErrorResponse> {
    const appRegistration =
      await this.appRegistrationService.findOneByClientId(clientId);

    if (!appRegistration) {
      return this.errorResponse('invalid_client', 'Client not found');
    }

    return appRegistration;
  }

  private async validateClientSecret(
    appRegistration: AppRegistrationEntity,
    clientSecret: string,
  ): Promise<OAuthErrorResponse | null> {
    const isValid = await this.appRegistrationService.verifyClientSecret(
      appRegistration,
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
    const codeChallenge = crypto
      .createHash('sha256')
      .update(codeVerifier)
      .digest()
      .toString('base64')
      .replace(/\+/g, '-')
      .replace(/\//g, '_')
      .replace(/=/g, '');

    const challengeToken = await this.appTokenRepository.findOne({
      where: {
        value: codeChallenge,
        type: AppTokenType.CodeChallenge,
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

  private async findApplicationByRegistrationAndWorkspace(
    appRegistrationId: string,
    workspaceId: string,
  ): Promise<ApplicationEntity | null> {
    return this.applicationRepository.findOne({
      where: { appRegistrationId, workspaceId },
    });
  }

  private errorResponse(
    error: string,
    errorDescription: string,
  ): OAuthErrorResponse {
    return { error, error_description: errorDescription };
  }
}
