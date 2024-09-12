import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import crypto from 'crypto';

import { render } from '@react-email/render';
import { addMilliseconds, differenceInMilliseconds } from 'date-fns';
import { Request } from 'express';
import { JsonWebTokenError, TokenExpiredError } from 'jsonwebtoken';
import ms from 'ms';
import { ExtractJwt } from 'passport-jwt';
import { PasswordResetLinkEmail } from 'twenty-emails';
import { IsNull, MoreThan, Repository } from 'typeorm';

import {
  AppToken,
  AppTokenType,
} from 'src/engine/core-modules/app-token/app-token.entity';
import {
  AuthException,
  AuthExceptionCode,
} from 'src/engine/core-modules/auth/auth.exception';
import { EmailPasswordResetLink } from 'src/engine/core-modules/auth/dto/email-password-reset-link.entity';
import { ExchangeAuthCode } from 'src/engine/core-modules/auth/dto/exchange-auth-code.entity';
import { ExchangeAuthCodeInput } from 'src/engine/core-modules/auth/dto/exchange-auth-code.input';
import { InvalidatePassword } from 'src/engine/core-modules/auth/dto/invalidate-password.entity';
import {
  ApiKeyToken,
  AuthToken,
  AuthTokens,
  PasswordResetToken,
} from 'src/engine/core-modules/auth/dto/token.entity';
import { ValidatePasswordResetToken } from 'src/engine/core-modules/auth/dto/validate-password-reset-token.entity';
import {
  JwtAuthStrategy,
  JwtPayload,
} from 'src/engine/core-modules/auth/strategies/jwt.auth.strategy';
import { AuthContext } from 'src/engine/core-modules/auth/types/auth-context.type';
import { EmailService } from 'src/engine/core-modules/email/email.service';
import { EnvironmentService } from 'src/engine/core-modules/environment/environment.service';
import { JwtWrapperService } from 'src/engine/core-modules/jwt/services/jwt-wrapper.service';
import { User } from 'src/engine/core-modules/user/user.entity';
import {
  Workspace,
  WorkspaceActivationStatus,
} from 'src/engine/core-modules/workspace/workspace.entity';
import { TwentyORMGlobalManager } from 'src/engine/twenty-orm/twenty-orm-global.manager';
import { WorkspaceMemberWorkspaceEntity } from 'src/modules/workspace-member/standard-objects/workspace-member.workspace-entity';

@Injectable()
export class TokenService {
  constructor(
    private readonly jwtWrapperService: JwtWrapperService,
    private readonly jwtStrategy: JwtAuthStrategy,
    private readonly environmentService: EnvironmentService,
    @InjectRepository(User, 'core')
    private readonly userRepository: Repository<User>,
    @InjectRepository(AppToken, 'core')
    private readonly appTokenRepository: Repository<AppToken>,
    @InjectRepository(Workspace, 'core')
    private readonly workspaceRepository: Repository<Workspace>,
    private readonly emailService: EmailService,
    private readonly twentyORMGlobalManager: TwentyORMGlobalManager,
  ) {}

  async generateAccessToken(
    userId: string,
    workspaceId?: string,
  ): Promise<AuthToken> {
    const expiresIn = this.environmentService.get('ACCESS_TOKEN_EXPIRES_IN');

    if (!expiresIn) {
      throw new AuthException(
        'Expiration time for access token is not set',
        AuthExceptionCode.INTERNAL_SERVER_ERROR,
      );
    }

    const expiresAt = addMilliseconds(new Date().getTime(), ms(expiresIn));

    const user = await this.userRepository.findOne({
      where: { id: userId },
      relations: ['defaultWorkspace'],
    });

    if (!user) {
      throw new AuthException(
        'User is not found',
        AuthExceptionCode.INVALID_INPUT,
      );
    }

    if (!user.defaultWorkspace) {
      throw new AuthException(
        'User does not have a default workspace',
        AuthExceptionCode.INVALID_DATA,
      );
    }

    const tokenWorkspaceId = workspaceId ?? user.defaultWorkspaceId;
    let tokenWorkspaceMemberId: string | undefined;

    if (
      user.defaultWorkspace.activationStatus ===
      WorkspaceActivationStatus.ACTIVE
    ) {
      const workspaceMemberRepository =
        await this.twentyORMGlobalManager.getRepositoryForWorkspace<WorkspaceMemberWorkspaceEntity>(
          tokenWorkspaceId,
          'workspaceMember',
        );

      const workspaceMember = await workspaceMemberRepository.findOne({
        where: {
          userId: user.id,
        },
      });

      if (!workspaceMember) {
        throw new AuthException(
          'User is not a member of the workspace',
          AuthExceptionCode.FORBIDDEN_EXCEPTION,
        );
      }

      tokenWorkspaceMemberId = workspaceMember.id;
    }

    const jwtPayload: JwtPayload = {
      sub: user.id,
      workspaceId: workspaceId ? workspaceId : user.defaultWorkspaceId,
      workspaceMemberId: tokenWorkspaceMemberId,
    };

    return {
      token: this.jwtWrapperService.sign(jwtPayload),
      expiresAt,
    };
  }

  async generateRefreshToken(userId: string): Promise<AuthToken> {
    const secret = this.environmentService.get('REFRESH_TOKEN_SECRET');
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

  async generateLoginToken(email: string): Promise<AuthToken> {
    const secret = this.environmentService.get('LOGIN_TOKEN_SECRET');
    const expiresIn = this.environmentService.get('LOGIN_TOKEN_EXPIRES_IN');

    if (!expiresIn) {
      throw new AuthException(
        'Expiration time for access token is not set',
        AuthExceptionCode.INTERNAL_SERVER_ERROR,
      );
    }

    const expiresAt = addMilliseconds(new Date().getTime(), ms(expiresIn));
    const jwtPayload = {
      sub: email,
    };

    return {
      token: this.jwtWrapperService.sign(jwtPayload, {
        secret,
        expiresIn,
      }),
      expiresAt,
    };
  }

  async generateTransientToken(
    workspaceMemberId: string,
    userId: string,
    workspaceId: string,
  ): Promise<AuthToken> {
    const secret = this.environmentService.get('LOGIN_TOKEN_SECRET');
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
    const secret = this.environmentService.get('ACCESS_TOKEN_SECRET');
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

  async validateToken(request: Request): Promise<AuthContext> {
    const token = ExtractJwt.fromAuthHeaderAsBearerToken()(request);

    if (!token) {
      throw new AuthException(
        'missing authentication token',
        AuthExceptionCode.FORBIDDEN_EXCEPTION,
      );
    }
    const decoded = await this.verifyJwt(
      token,
      this.environmentService.get('ACCESS_TOKEN_SECRET'),
    );

    const { user, apiKey, workspace, workspaceMemberId } =
      await this.jwtStrategy.validate(decoded as JwtPayload);

    return { user, apiKey, workspace, workspaceMemberId };
  }

  async verifyLoginToken(loginToken: string): Promise<string> {
    const loginTokenSecret = this.environmentService.get('LOGIN_TOKEN_SECRET');

    const payload = await this.verifyJwt(loginToken, loginTokenSecret);

    return payload.sub;
  }

  async verifyTransientToken(transientToken: string): Promise<{
    workspaceMemberId: string;
    userId: string;
    workspaceId: string;
  }> {
    const transientTokenSecret =
      this.environmentService.get('LOGIN_TOKEN_SECRET');

    const payload = await this.verifyJwt(transientToken, transientTokenSecret);

    return {
      workspaceMemberId: payload.sub,
      userId: payload.userId,
      workspaceId: payload.workspaceId,
    };
  }

  async generateSwitchWorkspaceToken(
    user: User,
    workspaceId: string,
  ): Promise<AuthTokens> {
    const userExists = await this.userRepository.findBy({ id: user.id });

    if (!userExists) {
      throw new AuthException(
        'User not found',
        AuthExceptionCode.INVALID_INPUT,
      );
    }

    const workspace = await this.workspaceRepository.findOne({
      where: { id: workspaceId },
      relations: ['workspaceUsers'],
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

    await this.userRepository.save({
      id: user.id,
      defaultWorkspace: workspace,
    });

    const token = await this.generateAccessToken(user.id, workspaceId);
    const refreshToken = await this.generateRefreshToken(user.id);

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

    const accessToken = await this.generateAccessToken(
      user.id,
      user.defaultWorkspaceId,
    );
    const refreshToken = await this.generateRefreshToken(user.id);
    const loginToken = await this.generateLoginToken(user.email);

    return {
      accessToken,
      refreshToken,
      loginToken,
    };
  }

  async verifyRefreshToken(refreshToken: string) {
    const secret = this.environmentService.get('REFRESH_TOKEN_SECRET');
    const coolDown = this.environmentService.get('REFRESH_TOKEN_COOL_DOWN');
    const jwtPayload = await this.verifyJwt(refreshToken, secret);

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
      token: { id },
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

    const accessToken = await this.generateAccessToken(user.id);
    const refreshToken = await this.generateRefreshToken(user.id);

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

  async verifyJwt(token: string, secret?: string) {
    try {
      return this.jwtWrapperService.verify(
        token,
        secret ? { secret } : undefined,
      );
    } catch (error) {
      if (error instanceof TokenExpiredError) {
        throw new AuthException(
          'Token has expired.',
          AuthExceptionCode.UNAUTHENTICATED,
        );
      } else if (error instanceof JsonWebTokenError) {
        throw new AuthException(
          'Token invalid.',
          AuthExceptionCode.UNAUTHENTICATED,
        );
      } else {
        throw new AuthException(
          'Unknown token error.',
          AuthExceptionCode.INVALID_INPUT,
        );
      }
    }
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

  async sendEmailPasswordResetLink(
    resetToken: PasswordResetToken,
    email: string,
  ): Promise<EmailPasswordResetLink> {
    const user = await this.userRepository.findOneBy({
      email,
    });

    if (!user) {
      throw new AuthException(
        'User not found',
        AuthExceptionCode.INVALID_INPUT,
      );
    }

    const frontBaseURL = this.environmentService.get('FRONT_BASE_URL');
    const resetLink = `${frontBaseURL}/reset-password/${resetToken.passwordResetToken}`;

    const emailData = {
      link: resetLink,
      duration: ms(
        differenceInMilliseconds(
          resetToken.passwordResetTokenExpiresAt,
          new Date(),
        ),
        {
          long: true,
        },
      ),
    };

    const emailTemplate = PasswordResetLinkEmail(emailData);
    const html = render(emailTemplate, {
      pretty: true,
    });

    const text = render(emailTemplate, {
      plainText: true,
    });

    this.emailService.send({
      from: `${this.environmentService.get(
        'EMAIL_FROM_NAME',
      )} <${this.environmentService.get('EMAIL_FROM_ADDRESS')}>`,
      to: email,
      subject: 'Action Needed to Reset Password',
      text,
      html,
    });

    return { success: true };
  }

  async validatePasswordResetToken(
    resetToken: string,
  ): Promise<ValidatePasswordResetToken> {
    const hashedResetToken = crypto
      .createHash('sha256')
      .update(resetToken)
      .digest('hex');

    const token = await this.appTokenRepository.findOne({
      where: {
        value: hashedResetToken,
        type: AppTokenType.PasswordResetToken,
        expiresAt: MoreThan(new Date()),
        revokedAt: IsNull(),
      },
    });

    if (!token || !token.userId) {
      throw new AuthException(
        'Token is invalid',
        AuthExceptionCode.FORBIDDEN_EXCEPTION,
      );
    }

    const user = await this.userRepository.findOneBy({
      id: token.userId,
    });

    if (!user) {
      throw new AuthException(
        'User not found',
        AuthExceptionCode.INVALID_INPUT,
      );
    }

    return {
      id: user.id,
      email: user.email,
    };
  }

  async invalidatePasswordResetToken(
    userId: string,
  ): Promise<InvalidatePassword> {
    const user = await this.userRepository.findOneBy({
      id: userId,
    });

    if (!user) {
      throw new AuthException(
        'User not found',
        AuthExceptionCode.INVALID_INPUT,
      );
    }

    await this.appTokenRepository.update(
      {
        userId,
        type: AppTokenType.PasswordResetToken,
      },
      {
        revokedAt: new Date(),
      },
    );

    return { success: true };
  }
}
