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
    const expiresIn = `${expiresInSeconds}s`;

    const expiresAt = addMilliseconds(new Date().getTime(), ms(expiresIn));

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

    const jwtPayload: ApplicationAccessTokenJwtPayload = {
      sub: applicationId,
      applicationId,
      workspaceId,
      type: JwtTokenTypeEnum.APPLICATION_ACCESS,
      ...(userWorkspaceId ? { userWorkspaceId } : {}),
      ...(userId ? { userId } : {}),
    };

    return {
      token: this.jwtWrapperService.sign(jwtPayload, {
        secret: this.jwtWrapperService.generateAppSecret(
          JwtTokenTypeEnum.APPLICATION_ACCESS,
          workspaceId,
        ),
        expiresIn,
      }),
      expiresAt,
    };
  }

  async generateApplicationRefreshToken({
    workspaceId,
    applicationId,
    userWorkspaceId,
    userId,
    expiresInSeconds = APPLICATION_REFRESH_TOKEN_EXPIRY_SECONDS,
  }: {
    workspaceId: string;
    applicationId: string;
    userWorkspaceId?: string;
    userId?: string;
    expiresInSeconds?: number;
  }): Promise<AuthToken> {
    const expiresIn = `${expiresInSeconds}s`;

    const expiresAt = addMilliseconds(new Date().getTime(), ms(expiresIn));

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

    const jwtPayload: ApplicationRefreshTokenJwtPayload = {
      sub: applicationId,
      applicationId,
      workspaceId,
      type: JwtTokenTypeEnum.APPLICATION_REFRESH,
      ...(userWorkspaceId ? { userWorkspaceId } : {}),
      ...(userId ? { userId } : {}),
    };

    return {
      token: this.jwtWrapperService.sign(jwtPayload, {
        secret: this.jwtWrapperService.generateAppSecret(
          JwtTokenTypeEnum.APPLICATION_REFRESH,
          workspaceId,
        ),
        expiresIn,
      }),
      expiresAt,
    };
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
    const [applicationAccessToken, applicationRefreshToken] = await Promise.all(
      [
        this.generateApplicationAccessToken({
          workspaceId,
          applicationId,
          userWorkspaceId,
          userId,
        }),
        this.generateApplicationRefreshToken({
          workspaceId,
          applicationId,
          userWorkspaceId,
          userId,
        }),
      ],
    );

    return { applicationAccessToken, applicationRefreshToken };
  }

  validateApplicationRefreshToken(
    refreshToken: string,
  ): ApplicationRefreshTokenJwtPayload {
    const decoded = this.jwtWrapperService.verifyJwtToken(refreshToken);

    const payload = decoded as unknown as ApplicationRefreshTokenJwtPayload;

    if (payload.type !== JwtTokenTypeEnum.APPLICATION_REFRESH) {
      throw new AuthException(
        'Invalid token type',
        AuthExceptionCode.INVALID_JWT_TOKEN_TYPE,
      );
    }

    return payload;
  }

  async renewApplicationTokens(refreshToken: string): Promise<{
    applicationAccessToken: AuthToken;
    applicationRefreshToken: AuthToken;
  }> {
    const payload = this.validateApplicationRefreshToken(refreshToken);

    return this.generateApplicationTokenPair({
      workspaceId: payload.workspaceId,
      applicationId: payload.applicationId,
      userWorkspaceId: payload.userWorkspaceId,
      userId: payload.userId,
    });
  }
}
