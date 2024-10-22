import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import crypto from 'crypto';

import { addMilliseconds } from 'date-fns';
import { Request } from 'express';
import ms from 'ms';
import { ExtractJwt } from 'passport-jwt';
import { Repository } from 'typeorm';

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
} from 'src/engine/core-modules/auth/dto/token.entity';
import { AccessTokenService } from 'src/engine/core-modules/auth/token/services/access-token.service';
import { LoginTokenService } from 'src/engine/core-modules/auth/token/services/login-token.service';
import { RefreshTokenService } from 'src/engine/core-modules/auth/token/services/refresh-token.service';
import { EnvironmentService } from 'src/engine/core-modules/environment/environment.service';
import { JwtWrapperService } from 'src/engine/core-modules/jwt/services/jwt-wrapper.service';
import { User } from 'src/engine/core-modules/user/user.entity';
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
    private readonly accessTokenService: AccessTokenService,
    private readonly loginTokenService: LoginTokenService,
    private readonly refreshTokenService: RefreshTokenService,
  ) {}

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
    const refreshToken = await this.refreshTokenService.generateRefreshToken(
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
    } = await this.refreshTokenService.verifyRefreshToken(token);

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
    const refreshToken = await this.refreshTokenService.generateRefreshToken(
      user.id,
      workspaceId,
    );

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
}
