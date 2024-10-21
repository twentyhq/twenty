import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import crypto from 'crypto';

import { addMilliseconds, differenceInMilliseconds } from 'date-fns';
import { Request } from 'express';
import ms from 'ms';
import { ExtractJwt } from 'passport-jwt';
import { IsNull, MoreThan, Repository } from 'typeorm';

import {
  AppToken,
  AppTokenType,
} from 'src/engine/core-modules/app-token/app-token.entity';
import {
  AuthException,
  AuthExceptionCode,
} from 'src/engine/core-modules/auth/auth.exception';
import { ExchangeAuthCode } from 'src/engine/core-modules/auth/dto/exchange-auth-code.entity';
import { ExchangeAuthCodeInput } from 'src/engine/core-modules/auth/dto/exchange-auth-code.input';
import {
  ApiKeyToken,
  AuthToken,
  AuthTokens,
  PasswordResetToken,
} from 'src/engine/core-modules/auth/dto/token.entity';
import { AccessTokenService } from 'src/engine/core-modules/auth/token/services/access-token.service';
import { LoginTokenService } from 'src/engine/core-modules/auth/token/services/login-token.service';
import { EnvironmentService } from 'src/engine/core-modules/environment/environment.service';
import { JwtWrapperService } from 'src/engine/core-modules/jwt/services/jwt-wrapper.service';
import { SSOService } from 'src/engine/core-modules/sso/services/sso.service';
import { User } from 'src/engine/core-modules/user/user.entity';
import { Workspace } from 'src/engine/core-modules/workspace/workspace.entity';
import { generateSecret } from 'src/utils/generate-secret';

@Injectable()
export class TokenService {
  constructor(
    private readonly jwtWrapperService: JwtWrapperService,
    private readonly environmentService: EnvironmentService,
    @InjectRepository(User, 'core')
    private readonly userRepository: Repository<User>,
    @InjectRepository(AppToken, 'core')
    private readonly appTokenRepository: Repository<AppToken>,
    @InjectRepository(Workspace, 'core')
    private readonly workspaceRepository: Repository<Workspace>,
    private readonly sSSOService: SSOService,
    private readonly accessTokenService: AccessTokenService,
    private readonly loginTokenService: LoginTokenService,
  ) {}

  async generateRefreshToken(
    userId: string,
    workspaceId: string,
  ): Promise<AuthToken> {
    const secret = this.jwtWrapperService.generateAppSecret(
      'REFRESH',
      workspaceId,
    );
    const expiresIn = this.environmentService.get('REFRESH_TOKEN_EXPIRES_IN');

    if (!expiresIn) {
      throw new AuthException(
        'Expiration time for access token is not set',
        AuthExceptionCode.INTERNAL_SERVER_ERROR,
      );
    }

    const expiresAt = addMilliseconds(new Date().getTime(), ms(expiresIn));

    const refreshTokenPayload = {
      userId,
      expiresAt,
      type: AppTokenType.RefreshToken,
    };
    const jwtPayload = {
      sub: userId,
    };

    const refreshToken = this.appTokenRepository.create(refreshTokenPayload);

    await this.appTokenRepository.save(refreshToken);

    return {
      token: this.jwtWrapperService.sign(jwtPayload, {
        secret,
        expiresIn,
        // Jwtid will be used to link RefreshToken entity to this token
        jwtid: refreshToken.id,
      }),
      expiresAt,
    };
  }

  async generateInvitationToken(workspaceId: string, email: string) {
    const expiresIn = this.environmentService.get(
      'INVITATION_TOKEN_EXPIRES_IN',
    );

    if (!expiresIn) {
      throw new AuthException(
        'Expiration time for invitation token is not set',
        AuthExceptionCode.INTERNAL_SERVER_ERROR,
      );
    }

    const expiresAt = addMilliseconds(new Date().getTime(), ms(expiresIn));

    const invitationToken = this.appTokenRepository.create({
      workspaceId,
      expiresAt,
      type: AppTokenType.InvitationToken,
      value: crypto.randomBytes(32).toString('hex'),
      context: {
        email,
      },
    });

    return this.appTokenRepository.save(invitationToken);
  }

  async generateTransientToken(
    workspaceMemberId: string,
    userId: string,
    workspaceId: string,
  ): Promise<AuthToken> {
    const secret = generateSecret(workspaceId, 'LOGIN');
    const expiresIn = this.environmentService.get(
      'SHORT_TERM_TOKEN_EXPIRES_IN',
    );

    if (!expiresIn) {
      throw new AuthException(
        'Expiration time for access token is not set',
        AuthExceptionCode.INTERNAL_SERVER_ERROR,
      );
    }

    const expiresAt = addMilliseconds(new Date().getTime(), ms(expiresIn));
    const jwtPayload = {
      sub: workspaceMemberId,
      userId,
      workspaceId,
    };

    return {
      token: this.jwtWrapperService.sign(jwtPayload, {
        secret,
        expiresIn,
      }),
      expiresAt,
    };
  }

  async generateApiKeyToken(
    workspaceId: string,
    apiKeyId?: string,
    expiresAt?: Date | string,
  ): Promise<Pick<ApiKeyToken, 'token'> | undefined> {
    if (!apiKeyId) {
      return;
    }
    const jwtPayload = {
      sub: workspaceId,
    };
    const secret = generateSecret(workspaceId, 'ACCESS');
    let expiresIn: string | number;

    if (expiresAt) {
      expiresIn = Math.floor(
        (new Date(expiresAt).getTime() - new Date().getTime()) / 1000,
      );
    } else {
      expiresIn = this.environmentService.get('API_TOKEN_EXPIRES_IN');
    }
    const token = this.jwtWrapperService.sign(jwtPayload, {
      secret,
      expiresIn,
      jwtid: apiKeyId,
    });

    return { token };
  }

  isTokenPresent(request: Request): boolean {
    const token = ExtractJwt.fromAuthHeaderAsBearerToken()(request);

    return !!token;
  }

  async verifyTransientToken(transientToken: string): Promise<{
    workspaceMemberId: string;
    userId: string;
    workspaceId: string;
  }> {
    await this.jwtWrapperService.verifyWorkspaceToken(transientToken, 'LOGIN');

    const payload = await this.jwtWrapperService.decode(transientToken);

    return {
      workspaceMemberId: payload.sub,
      userId: payload.userId,
      workspaceId: payload.workspaceId,
    };
  }

  async switchWorkspace(user: User, workspaceId: string) {
    const userExists = await this.userRepository.findBy({ id: user.id });

    if (!userExists) {
      throw new AuthException(
        'User not found',
        AuthExceptionCode.INVALID_INPUT,
      );
    }

    const workspace = await this.workspaceRepository.findOne({
      where: { id: workspaceId },
      relations: ['workspaceUsers', 'workspaceSSOIdentityProviders'],
    });

    if (!workspace) {
      throw new AuthException(
        'workspace doesnt exist',
        AuthExceptionCode.INVALID_INPUT,
      );
    }

    if (
      !workspace.workspaceUsers
        .map((userWorkspace) => userWorkspace.userId)
        .includes(user.id)
    ) {
      throw new AuthException(
        'user does not belong to workspace',
        AuthExceptionCode.FORBIDDEN_EXCEPTION,
      );
    }

    if (workspace.workspaceSSOIdentityProviders.length > 0) {
      return {
        useSSOAuth: true,
        workspace,
        availableSSOIdentityProviders:
          await this.sSSOService.listSSOIdentityProvidersByWorkspaceId(
            workspaceId,
          ),
      } as {
        useSSOAuth: true;
        workspace: Workspace;
        availableSSOIdentityProviders: Awaited<
          ReturnType<
            typeof this.sSSOService.listSSOIdentityProvidersByWorkspaceId
          >
        >;
      };
    }

    return {
      useSSOAuth: false,
      workspace,
    } as {
      useSSOAuth: false;
      workspace: Workspace;
    };
  }

  async generateSwitchWorkspaceToken(
    user: User,
    workspace: Workspace,
  ): Promise<AuthTokens> {
    await this.userRepository.save({
      id: user.id,
      defaultWorkspace: workspace,
    });

    const token = await this.accessTokenService.generateAccessToken(
      user.id,
      workspace.id,
    );
    const refreshToken = await this.generateRefreshToken(user.id, workspace.id);

    return {
      tokens: {
        accessToken: token,
        refreshToken,
      },
    };
  }

  async verifyAuthorizationCode(
    exchangeAuthCodeInput: ExchangeAuthCodeInput,
  ): Promise<ExchangeAuthCode> {
    const { authorizationCode, codeVerifier } = exchangeAuthCodeInput;

    if (!authorizationCode) {
      throw new AuthException(
        'Authorization code not found',
        AuthExceptionCode.INVALID_INPUT,
      );
    }

    let userId = '';

    if (codeVerifier) {
      const authorizationCodeAppToken = await this.appTokenRepository.findOne({
        where: {
          value: authorizationCode,
        },
      });

      if (!authorizationCodeAppToken) {
        throw new AuthException(
          'Authorization code does not exist',
          AuthExceptionCode.INVALID_INPUT,
        );
      }

      if (!(authorizationCodeAppToken.expiresAt.getTime() >= Date.now())) {
        throw new AuthException(
          'Authorization code expired.',
          AuthExceptionCode.FORBIDDEN_EXCEPTION,
        );
      }

      const codeChallenge = crypto
        .createHash('sha256')
        .update(codeVerifier)
        .digest()
        .toString('base64')
        .replace(/\+/g, '-')
        .replace(/\//g, '_')
        .replace(/=/g, '');

      const codeChallengeAppToken = await this.appTokenRepository.findOne({
        where: {
          value: codeChallenge,
        },
      });

      if (!codeChallengeAppToken || !codeChallengeAppToken.userId) {
        throw new AuthException(
          'code verifier doesnt match the challenge',
          AuthExceptionCode.FORBIDDEN_EXCEPTION,
        );
      }

      if (!(codeChallengeAppToken.expiresAt.getTime() >= Date.now())) {
        throw new AuthException(
          'code challenge expired.',
          AuthExceptionCode.FORBIDDEN_EXCEPTION,
        );
      }

      if (codeChallengeAppToken.userId !== authorizationCodeAppToken.userId) {
        throw new AuthException(
          'authorization code / code verifier was not created by same client',
          AuthExceptionCode.FORBIDDEN_EXCEPTION,
        );
      }

      if (codeChallengeAppToken.revokedAt) {
        throw new AuthException(
          'Token has been revoked.',
          AuthExceptionCode.FORBIDDEN_EXCEPTION,
        );
      }

      await this.appTokenRepository.save({
        id: codeChallengeAppToken.id,
        revokedAt: new Date(),
      });

      userId = codeChallengeAppToken.userId;
    }

    const user = await this.userRepository.findOne({
      where: { id: userId },
      relations: ['defaultWorkspace'],
    });

    if (!user) {
      throw new AuthException(
        'User who generated the token does not exist',
        AuthExceptionCode.INVALID_INPUT,
      );
    }

    if (!user.defaultWorkspace) {
      throw new AuthException(
        'User does not have a default workspace',
        AuthExceptionCode.INVALID_DATA,
      );
    }

    const accessToken = await this.accessTokenService.generateAccessToken(
      user.id,
      user.defaultWorkspaceId,
    );
    const refreshToken = await this.generateRefreshToken(
      user.id,
      user.defaultWorkspaceId,
    );
    const loginToken = await this.loginTokenService.generateLoginToken(
      user.email,
    );

    return {
      accessToken,
      refreshToken,
      loginToken,
    };
  }

  async verifyRefreshToken(refreshToken: string) {
    const coolDown = this.environmentService.get('REFRESH_TOKEN_COOL_DOWN');

    await this.jwtWrapperService.verifyWorkspaceToken(refreshToken, 'REFRESH');
    const jwtPayload = await this.jwtWrapperService.decode(refreshToken);

    if (!(jwtPayload.jti && jwtPayload.sub)) {
      throw new AuthException(
        'This refresh token is malformed',
        AuthExceptionCode.INVALID_INPUT,
      );
    }

    const token = await this.appTokenRepository.findOneBy({
      id: jwtPayload.jti,
    });

    if (!token) {
      throw new AuthException(
        "This refresh token doesn't exist",
        AuthExceptionCode.INVALID_INPUT,
      );
    }

    const user = await this.userRepository.findOne({
      where: { id: jwtPayload.sub },
      relations: ['appTokens'],
    });

    if (!user) {
      throw new AuthException(
        'User not found',
        AuthExceptionCode.INVALID_INPUT,
      );
    }

    // Check if revokedAt is less than coolDown
    if (
      token.revokedAt &&
      token.revokedAt.getTime() <= Date.now() - ms(coolDown)
    ) {
      // Revoke all user refresh tokens
      await Promise.all(
        user.appTokens.map(async ({ id, type }) => {
          if (type === AppTokenType.RefreshToken) {
            await this.appTokenRepository.update(
              { id },
              {
                revokedAt: new Date(),
              },
            );
          }
        }),
      );

      throw new AuthException(
        'Suspicious activity detected, this refresh token has been revoked. All tokens have been revoked.',
        AuthExceptionCode.FORBIDDEN_EXCEPTION,
      );
    }

    return { user, token };
  }

  async generateTokensFromRefreshToken(token: string): Promise<{
    accessToken: AuthToken;
    refreshToken: AuthToken;
  }> {
    if (!token) {
      throw new AuthException(
        'Refresh token not found',
        AuthExceptionCode.INVALID_INPUT,
      );
    }

    const {
      user,
      token: { id, workspaceId },
    } = await this.verifyRefreshToken(token);

    // Revoke old refresh token
    await this.appTokenRepository.update(
      {
        id,
      },
      {
        revokedAt: new Date(),
      },
    );

    const accessToken = await this.accessTokenService.generateAccessToken(
      user.id,
      workspaceId,
    );
    const refreshToken = await this.generateRefreshToken(user.id, workspaceId);

    return {
      accessToken,
      refreshToken,
    };
  }

  computeRedirectURI(loginToken: string): string {
    return `${this.environmentService.get(
      'FRONT_BASE_URL',
    )}/verify?loginToken=${loginToken}`;
  }

  async generatePasswordResetToken(email: string): Promise<PasswordResetToken> {
    const user = await this.userRepository.findOneBy({
      email,
    });

    if (!user) {
      throw new AuthException(
        'User not found',
        AuthExceptionCode.INVALID_INPUT,
      );
    }

    const expiresIn = this.environmentService.get(
      'PASSWORD_RESET_TOKEN_EXPIRES_IN',
    );

    if (!expiresIn) {
      throw new AuthException(
        'PASSWORD_RESET_TOKEN_EXPIRES_IN constant value not found',
        AuthExceptionCode.INTERNAL_SERVER_ERROR,
      );
    }

    const existingToken = await this.appTokenRepository.findOne({
      where: {
        userId: user.id,
        type: AppTokenType.PasswordResetToken,
        expiresAt: MoreThan(new Date()),
        revokedAt: IsNull(),
      },
    });

    if (existingToken) {
      const timeToWait = ms(
        differenceInMilliseconds(existingToken.expiresAt, new Date()),
        { long: true },
      );

      throw new AuthException(
        `Token has already been generated. Please wait for ${timeToWait} to generate again.`,
        AuthExceptionCode.INVALID_INPUT,
      );
    }

    const plainResetToken = crypto.randomBytes(32).toString('hex');
    const hashedResetToken = crypto
      .createHash('sha256')
      .update(plainResetToken)
      .digest('hex');

    const expiresAt = addMilliseconds(new Date().getTime(), ms(expiresIn));

    await this.appTokenRepository.save({
      userId: user.id,
      value: hashedResetToken,
      expiresAt,
      type: AppTokenType.PasswordResetToken,
    });

    return {
      passwordResetToken: plainResetToken,
      passwordResetTokenExpiresAt: expiresAt,
    };
  }
}
