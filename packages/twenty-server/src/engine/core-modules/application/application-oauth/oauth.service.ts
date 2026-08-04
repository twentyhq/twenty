import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import crypto from 'crypto';

import ms from 'ms';
import { Repository } from 'typeorm';
import { base64UrlEncode, isDefined } from 'twenty-shared/utils';

import {
  AppTokenEntity,
  AppTokenType,
} from 'src/engine/core-modules/app-token/app-token.entity';
import { ApplicationAuthorizationService } from 'src/engine/core-modules/application/application-authorization/services/application-authorization.service';
import { ApplicationInstallService } from 'src/engine/core-modules/application/application-install/application-install.service';
import { ApplicationRegistrationEntity } from 'src/engine/core-modules/application/application-registration/application-registration.entity';
import { ApplicationRegistrationService } from 'src/engine/core-modules/application/application-registration/application-registration.service';
import { ApplicationEntity } from 'src/engine/core-modules/application/application.entity';
import { ApplicationService } from 'src/engine/core-modules/application/application.service';
import { OAuthErrorResponse } from 'src/engine/core-modules/application/application-oauth/types/oauth-error-response.type';
import { OAuthTokenResponse } from 'src/engine/core-modules/application/application-oauth/types/oauth-token-response.type';
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
    private readonly applicationAuthorizationService: ApplicationAuthorizationService,
    private readonly applicationRegistrationService: ApplicationRegistrationService,
    private readonly applicationService: ApplicationService,
    private readonly applicationInstallService: ApplicationInstallService,
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

    if (applicationRegistration.oAuthClientSecretHash && !clientSecret) {
      return this.errorResponse(
        'invalid_client',
        'Client authentication required for confidential clients',
      );
    }

    if (clientSecret) {
      const secretError = await this.validateClientSecret(
        applicationRegistration,
        clientSecret,
      );

      if (secretError) {
        return secretError;
      }
    }

    const hashedAuthorizationCode = crypto
      .createHash('sha256')
      .update(authorizationCode)
      .digest('hex');

    const authCodeToken = await this.appTokenRepository.findOne({
      where: {
        value: hashedAuthorizationCode,
        type: AppTokenType.AuthorizationCode,
      },
    });

    if (!authCodeToken) {
      return this.errorResponse(
        'invalid_grant',
        'Authorization code not found',
      );
    }

    // RFC 6749 §4.1.2: if a previously used code is presented, this indicates
    // a potential compromise — log a security warning
    if (authCodeToken.revokedAt) {
      this.logger.warn(
        `Authorization code replay detected for client ${clientId}. ` +
          `Code was already used at ${authCodeToken.revokedAt.toISOString()}.`,
      );

      return this.errorResponse(
        'invalid_grant',
        'Authorization code has already been used',
      );
    }

    if (authCodeToken.expiresAt.getTime() < Date.now()) {
      return this.errorResponse('invalid_grant', 'Authorization code expired');
    }

    // RFC 6749 §4.1.3: auth code must have been issued to this client
    const storedClientId = authCodeToken.context?.clientId;

    if (!storedClientId || storedClientId !== clientId) {
      return this.errorResponse(
        'invalid_grant',
        'Authorization code was not issued to this client',
      );
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

    // PKCE: if code_challenge was stored, code_verifier is required
    const storedCodeChallenge = authCodeToken.context?.codeChallenge;

    if (storedCodeChallenge) {
      if (!codeVerifier) {
        return this.errorResponse(
          'invalid_request',
          'code_verifier is required (PKCE was used in authorization)',
        );
      }

      const computedChallenge = base64UrlEncode(
        crypto.createHash('sha256').update(codeVerifier).digest(),
      );

      if (computedChallenge !== storedCodeChallenge) {
        return this.errorResponse(
          'invalid_grant',
          'Code verifier does not match the code challenge',
        );
      }
    } else if (codeVerifier) {
      return this.errorResponse(
        'invalid_request',
        'code_verifier provided but no code_challenge was used in authorization',
      );
    }

    if (!clientSecret && !storedCodeChallenge) {
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

    if (!userWorkspace) {
      return this.errorResponse(
        'invalid_grant',
        'User no longer has access to this workspace',
      );
    }

    const grantedScope =
      authCodeToken.context?.scope ??
      applicationRegistration.oAuthScopes.join(' ');

    // Recorded before the tokens exist, so a refresh token is never handed out
    // without the grant that makes it redeemable and revocable.
    await this.applicationAuthorizationService.recordAuthorization({
      userId: authCodeToken.userId,
      workspaceId: authCodeToken.workspaceId,
      userWorkspaceId: userWorkspace.id,
      applicationId: application.id,
      scopes: this.parseScopes(grantedScope),
    });

    const { applicationAccessToken, applicationRefreshToken } =
      await this.applicationTokenService.generateApplicationTokenPair({
        workspaceId: authCodeToken.workspaceId,
        applicationId: application.id,
        userId: authCodeToken.userId,
        userWorkspaceId: userWorkspace.id,
      });

    this.logger.log(
      `Authorization code exchanged: client=${clientId} workspace=${authCodeToken.workspaceId} user=${authCodeToken.userId}`,
    );

    return {
      access_token: applicationAccessToken.token,
      token_type: 'Bearer',
      expires_in: this.getAccessTokenExpiresInSeconds(),
      refresh_token: applicationRefreshToken.token,
      scope: grantedScope,
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

    this.logger.log(
      `Client credentials token issued: client=${clientId} workspace=${application.workspaceId}`,
    );

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

    // Confidential clients (those with a secret) must authenticate
    if (applicationRegistration.oAuthClientSecretHash && !clientSecret) {
      return this.errorResponse(
        'invalid_client',
        'Client authentication required for confidential clients',
      );
    }

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
        await this.applicationTokenService.validateApplicationRefreshToken(
          refreshToken,
        );

      // Verify the refresh token belongs to this client
      const application = await this.applicationRepository.findOne({
        where: { id: payload.applicationId },
      });

      if (
        !application ||
        application.applicationRegistrationId !== applicationRegistration.id
      ) {
        return this.errorResponse(
          'invalid_grant',
          'Refresh token was not issued to this client',
        );
      }

      if (isDefined(payload.userId)) {
        const authorizationError = await this.consumeUserAuthorization({
          userId: payload.userId,
          workspaceId: payload.workspaceId,
          applicationId: application.id,
        });

        if (authorizationError) {
          return authorizationError;
        }
      }

      const { applicationAccessToken, applicationRefreshToken } =
        await this.applicationTokenService.renewApplicationTokens(payload);

      this.logger.log(
        `Refresh token exchanged: client=${clientId} application=${payload.applicationId}`,
      );

      return {
        access_token: applicationAccessToken.token,
        token_type: 'Bearer',
        expires_in: this.getAccessTokenExpiresInSeconds(),
        refresh_token: applicationRefreshToken.token,
        scope: applicationRegistration.oAuthScopes.join(' '),
      };
    } catch (error) {
      this.logger.warn(`Refresh token grant failed: client=${clientId}`, error);

      return this.errorResponse(
        'invalid_grant',
        'Invalid or expired refresh token',
      );
    }
  }

  // RFC 7009: Token revocation
  // Returns true if token was successfully processed (even if already invalid)
  async revokeToken(params: {
    token: string;
    clientId?: string;
    clientSecret?: string;
  }): Promise<{ success: boolean }> {
    const { token, clientId, clientSecret } = params;

    let applicationRegistration: ApplicationRegistrationEntity | undefined;

    if (clientId) {
      const clientValidation = await this.validateClient(clientId);

      if ('error' in clientValidation) {
        return { success: false };
      }

      if (clientSecret) {
        const secretError = await this.validateClientSecret(
          clientValidation,
          clientSecret,
        );

        if (secretError) {
          return { success: false };
        }
      }

      applicationRegistration = clientValidation;
    }

    try {
      const payload =
        await this.applicationTokenService.validateApplicationRefreshToken(
          token,
        );

      // RFC 7009 §2.1: revoking a refresh token invalidates the authorization
      // behind it, and only the client the token was issued to may ask for
      // that. Access tokens stay stateless and live out their few minutes.
      if (isDefined(applicationRegistration) && isDefined(payload.userId)) {
        const application = await this.applicationRepository.findOne({
          where: { id: payload.applicationId },
        });

        if (
          application?.applicationRegistrationId === applicationRegistration.id
        ) {
          await this.revokeUserAuthorization({
            userId: payload.userId,
            workspaceId: payload.workspaceId,
            applicationId: payload.applicationId,
          });
        }
      }

      this.logger.log(
        `Token revocation requested for application ${payload.applicationId}`,
      );
    } catch {
      // Per RFC 7009 §2.2: the server responds with HTTP 200 for both
      // valid and invalid tokens
    }

    return { success: true };
  }

  // RFC 7662: Token introspection
  async introspectToken(params: {
    token: string;
    clientId: string;
    clientSecret?: string;
  }): Promise<Record<string, unknown>> {
    const { token, clientId, clientSecret } = params;

    const clientValidation = await this.validateClient(clientId);

    if ('error' in clientValidation) {
      return { active: false };
    }

    if (clientSecret) {
      const secretError = await this.validateClientSecret(
        clientValidation,
        clientSecret,
      );

      if (secretError) {
        return { active: false };
      }
    }

    try {
      await this.applicationTokenService.validateApplicationRefreshToken(token);

      const decoded = this.applicationTokenService.decodeToken(token);

      if (!decoded) {
        return { active: false };
      }

      // Verify the token belongs to this client
      const application = await this.applicationRepository.findOne({
        where: { id: decoded.applicationId },
      });

      if (
        !application ||
        application.applicationRegistrationId !== clientValidation.id
      ) {
        return { active: false };
      }

      if (
        isDefined(decoded.userId) &&
        (await this.isAuthorizationRevoked({
          userId: decoded.userId,
          applicationId: decoded.applicationId,
        }))
      ) {
        return { active: false };
      }

      return {
        active: true,
        sub: decoded.sub,
        client_id: clientId,
        token_type: 'Bearer',
        scope: clientValidation.oAuthScopes.join(' '),
        aud: decoded.workspaceId,
        iss: this.twentyConfigService.get('SERVER_URL'),
        exp: decoded.exp,
        iat: decoded.iat,
      };
    } catch {
      // Try as access token (with signature verification)
      try {
        const payload =
          await this.applicationTokenService.validateApplicationAccessToken(
            token,
          );

        const application = await this.applicationRepository.findOne({
          where: { id: payload.applicationId },
        });

        if (
          !application ||
          application.applicationRegistrationId !== clientValidation.id
        ) {
          return { active: false };
        }

        return {
          active: true,
          sub: payload.sub,
          client_id: clientId,
          token_type: 'Bearer',
          scope: clientValidation.oAuthScopes.join(' '),
          aud: payload.workspaceId,
          iss: this.twentyConfigService.get('SERVER_URL'),
        };
      } catch {
        return { active: false };
      }
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

  // Refresh tokens issued before authorizations were recorded have no row to
  // check against. Rejecting them would sign every live integration out the
  // moment this ships, so the first refresh backfills the grant that was always
  // implied. A revoked authorization keeps its row, so this never resurrects
  // access the user turned off.
  private async consumeUserAuthorization({
    userId,
    workspaceId,
    applicationId,
  }: {
    userId: string;
    workspaceId: string;
    applicationId: string;
  }): Promise<OAuthErrorResponse | null> {
    const authorization =
      await this.applicationAuthorizationService.findByUserAndApplication({
        userId,
        applicationId,
      });

    if (isDefined(authorization?.revokedAt)) {
      return this.errorResponse(
        'invalid_grant',
        'The user revoked this application access',
      );
    }

    // Rechecked on every refresh, not just when backfilling: removing a member
    // soft-deletes the membership, so an existing grant outlives it and nothing
    // else in this path would notice.
    const userWorkspace = await this.userWorkspaceRepository.findOne({
      where: { userId, workspaceId },
    });

    if (!userWorkspace) {
      return this.errorResponse(
        'invalid_grant',
        'User no longer has access to this workspace',
      );
    }

    if (!isDefined(authorization)) {
      await this.applicationAuthorizationService.backfillAuthorizationFromRefreshToken(
        {
          userId,
          workspaceId,
          userWorkspaceId: userWorkspace.id,
          applicationId,
        },
      );

      return null;
    }

    await this.applicationAuthorizationService.touchLastUsedAt(
      authorization.id,
    );

    return null;
  }

  // A token predating the authorization record has no row to mark revoked, and
  // the refresh path would then happily backfill a fresh active one. Lay the
  // row down first so the revocation has something to stick to. If the
  // membership is gone the refresh already fails on that, so there is nothing
  // worth recording.
  private async revokeUserAuthorization({
    userId,
    workspaceId,
    applicationId,
  }: {
    userId: string;
    workspaceId: string;
    applicationId: string;
  }): Promise<void> {
    const userWorkspace = await this.userWorkspaceRepository.findOne({
      where: { userId, workspaceId },
    });

    if (isDefined(userWorkspace)) {
      await this.applicationAuthorizationService.backfillAuthorizationFromRefreshToken(
        {
          userId,
          workspaceId,
          userWorkspaceId: userWorkspace.id,
          applicationId,
        },
      );
    }

    await this.applicationAuthorizationService.revokeAuthorizationForApplication(
      {
        userId,
        applicationId,
      },
    );
  }

  private async isAuthorizationRevoked({
    userId,
    applicationId,
  }: {
    userId: string;
    applicationId: string;
  }): Promise<boolean> {
    const authorization =
      await this.applicationAuthorizationService.findByUserAndApplication({
        userId,
        applicationId,
      });

    return isDefined(authorization?.revokedAt);
  }

  // RFC 6749 §3.3: scope is a space-delimited list, so an empty value has to
  // collapse to no scopes rather than to one blank one.
  private parseScopes(scope: string): string[] {
    return scope.split(' ').filter((entry) => entry.length > 0);
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

    try {
      await this.applicationInstallService.installApplication({
        appRegistrationId: applicationRegistration.id,
        workspaceId,
      });

      const installedApplication = await this.applicationRepository.findOne({
        where: {
          applicationRegistrationId: applicationRegistration.id,
          workspaceId,
        },
      });

      if (installedApplication) {
        return installedApplication;
      }

      this.logger.warn(
        `Install succeeded but application not found in workspace, falling back to bare creation`,
      );
    } catch (error) {
      this.logger.warn(
        `Auto-install failed for ${applicationRegistration.name}, falling back to bare creation`,
        error,
      );
    }

    return this.applicationService.create({
      universalIdentifier: applicationRegistration.universalIdentifier,
      name: applicationRegistration.name,
      description: `OAuth application registered as "${applicationRegistration.name}"`,
      version: applicationRegistration.latestAvailableVersion ?? '1.0.0',
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
