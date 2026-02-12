import { InjectRepository } from '@nestjs/typeorm';
import { Inject, Injectable } from '@nestjs/common';

import { type Repository } from 'typeorm';
import { addMilliseconds } from 'date-fns';
import { assertIsDefinedOrThrow } from 'twenty-shared/utils';
import ms from 'ms';

import { JwtWrapperService } from 'src/engine/core-modules/jwt/services/jwt-wrapper.service';
import { WorkspaceEntity } from 'src/engine/core-modules/workspace/workspace.entity';
import {
  type ApplicationAccessTokenJwtPayload,
  type ApplicationRefreshTokenJwtPayload,
  JwtTokenTypeEnum,
} from 'src/engine/core-modules/auth/types/auth-context.type';
import { type AuthToken } from 'src/engine/core-modules/auth/dto/auth-token.dto';
import { WorkspaceNotFoundDefaultError } from 'src/engine/core-modules/workspace/workspace.exception';
import { ApplicationEntity } from 'src/engine/core-modules/application/application.entity';
import {
  ApplicationException,
  ApplicationExceptionCode,
} from 'src/engine/core-modules/application/application.exception';
import {
  AuthException,
  AuthExceptionCode,
} from 'src/engine/core-modules/auth/auth.exception';

const APPLICATION_ACCESS_TOKEN_EXPIRY_SECONDS = 1800;
const APPLICATION_REFRESH_TOKEN_EXPIRY_SECONDS = 60 * 60 * 24 * 60; // 60 days

@Injectable()
export class ApplicationTokenService {
  constructor(
    @Inject(JwtWrapperService)
    private readonly jwtWrapperService: JwtWrapperService,
    @InjectRepository(WorkspaceEntity)
    private readonly workspaceRepository: Repository<WorkspaceEntity>,
    @InjectRepository(ApplicationEntity)
    private readonly applicationRepository: Repository<ApplicationEntity>,
  ) {}

  async generateApplicationAccessToken({
    workspaceId,
    applicationId,
    userWorkspaceId,
    userId,
    expiresInSeconds = APPLICATION_ACCESS_TOKEN_EXPIRY_SECONDS,
  }: {
    workspaceId: string;
    applicationId: string;
    userWorkspaceId?: string;
    userId?: string;
    expiresInSeconds?: number;
  }): Promise<AuthToken> {
    await this.validateWorkspaceAndApplication(workspaceId, applicationId);

    return this.signApplicationToken({
      workspaceId,
      applicationId,
      userWorkspaceId,
      userId,
      tokenType: JwtTokenTypeEnum.APPLICATION_ACCESS,
      expiresInSeconds,
    });
  }

  async generateApplicationTokenPair({
    workspaceId,
    applicationId,
    userWorkspaceId,
    userId,
  }: {
    workspaceId: string;
    applicationId: string;
    userWorkspaceId?: string;
    userId?: string;
  }): Promise<{
    applicationAccessToken: AuthToken;
    applicationRefreshToken: AuthToken;
  }> {
    await this.validateWorkspaceAndApplication(workspaceId, applicationId);

    const [applicationAccessToken, applicationRefreshToken] = await Promise.all(
      [
        this.signApplicationToken({
          workspaceId,
          applicationId,
          userWorkspaceId,
          userId,
          tokenType: JwtTokenTypeEnum.APPLICATION_ACCESS,
          expiresInSeconds: APPLICATION_ACCESS_TOKEN_EXPIRY_SECONDS,
        }),
        this.signApplicationToken({
          workspaceId,
          applicationId,
          userWorkspaceId,
          userId,
          tokenType: JwtTokenTypeEnum.APPLICATION_REFRESH,
          expiresInSeconds: APPLICATION_REFRESH_TOKEN_EXPIRY_SECONDS,
        }),
      ],
    );

    return { applicationAccessToken, applicationRefreshToken };
  }

  validateApplicationRefreshToken(
    refreshToken: string,
  ): ApplicationRefreshTokenJwtPayload {
    this.jwtWrapperService.verifyJwtToken(refreshToken);

    const payload =
      this.jwtWrapperService.decode<ApplicationRefreshTokenJwtPayload>(
        refreshToken,
        { json: true },
      );

    if (payload.type !== JwtTokenTypeEnum.APPLICATION_REFRESH) {
      throw new AuthException(
        'Expected an application refresh token',
        AuthExceptionCode.INVALID_JWT_TOKEN_TYPE,
      );
    }

    return payload;
  }

  async renewApplicationTokens(payload: {
    workspaceId: string;
    applicationId: string;
    userWorkspaceId?: string;
    userId?: string;
  }): Promise<{
    applicationAccessToken: AuthToken;
    applicationRefreshToken: AuthToken;
  }> {
    return this.generateApplicationTokenPair({
      workspaceId: payload.workspaceId,
      applicationId: payload.applicationId,
      userWorkspaceId: payload.userWorkspaceId,
      userId: payload.userId,
    });
  }

  private async validateWorkspaceAndApplication(
    workspaceId: string,
    applicationId: string,
  ): Promise<void> {
    const workspace = await this.workspaceRepository.findOne({
      where: { id: workspaceId },
    });

    assertIsDefinedOrThrow(workspace, WorkspaceNotFoundDefaultError);

    const application = await this.applicationRepository.findOne({
      where: { id: applicationId, workspaceId },
    });

    assertIsDefinedOrThrow(
      application,
      new ApplicationException(
        'Application not found',
        ApplicationExceptionCode.APPLICATION_NOT_FOUND,
      ),
    );
  }

  private signApplicationToken({
    workspaceId,
    applicationId,
    userWorkspaceId,
    userId,
    tokenType,
    expiresInSeconds,
  }: {
    workspaceId: string;
    applicationId: string;
    userWorkspaceId?: string;
    userId?: string;
    tokenType:
      | JwtTokenTypeEnum.APPLICATION_ACCESS
      | JwtTokenTypeEnum.APPLICATION_REFRESH;
    expiresInSeconds: number;
  }): AuthToken {
    const expiresIn = `${expiresInSeconds}s`;
    const expiresAt = addMilliseconds(new Date().getTime(), ms(expiresIn));

    const jwtPayload:
      | ApplicationAccessTokenJwtPayload
      | ApplicationRefreshTokenJwtPayload = {
      sub: applicationId,
      applicationId,
      workspaceId,
      type: tokenType,
      ...(userWorkspaceId ? { userWorkspaceId } : {}),
      ...(userId ? { userId } : {}),
    };

    return {
      token: this.jwtWrapperService.sign(jwtPayload, {
        secret: this.jwtWrapperService.generateAppSecret(
          tokenType,
          workspaceId,
        ),
        expiresIn,
      }),
      expiresAt,
    };
  }
}
