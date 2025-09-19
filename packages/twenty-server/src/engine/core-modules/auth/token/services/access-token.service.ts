import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { addMilliseconds } from 'date-fns';
import { type Request } from 'express';
import ms from 'ms';
import { isWorkspaceActiveOrSuspended } from 'twenty-shared/workspace';
import { Repository } from 'typeorm';
import { assertIsDefinedOrThrow } from 'twenty-shared/utils';

import {
  AuthException,
  AuthExceptionCode,
} from 'src/engine/core-modules/auth/auth.exception';
import { type AuthToken } from 'src/engine/core-modules/auth/dto/token.entity';
import { JwtAuthStrategy } from 'src/engine/core-modules/auth/strategies/jwt.auth.strategy';
import {
  type AccessTokenJwtPayload,
  type AuthContext,
  JwtTokenTypeEnum,
} from 'src/engine/core-modules/auth/types/auth-context.type';
import { JwtWrapperService } from 'src/engine/core-modules/jwt/services/jwt-wrapper.service';
import { TwentyConfigService } from 'src/engine/core-modules/twenty-config/twenty-config.service';
import { UserWorkspace } from 'src/engine/core-modules/user-workspace/user-workspace.entity';
import { User } from 'src/engine/core-modules/user/user.entity';
import { userValidator } from 'src/engine/core-modules/user/user.validate';
import { Workspace } from 'src/engine/core-modules/workspace/workspace.entity';
import { TwentyORMGlobalManager } from 'src/engine/twenty-orm/twenty-orm-global.manager';
import { type WorkspaceMemberWorkspaceEntity } from 'src/modules/workspace-member/standard-objects/workspace-member.workspace-entity';
import { WorkspaceNotFoundDefaultError } from 'src/engine/core-modules/workspace/workspace.exception';
import { UserWorkspaceNotFoundDefaultError } from 'src/engine/core-modules/user-workspace/user-workspace.exception';

@Injectable()
export class AccessTokenService {
  constructor(
    private readonly jwtWrapperService: JwtWrapperService,
    private readonly jwtStrategy: JwtAuthStrategy,
    private readonly twentyConfigService: TwentyConfigService,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(Workspace)
    private readonly workspaceRepository: Repository<Workspace>,
    private readonly twentyORMGlobalManager: TwentyORMGlobalManager,
    @InjectRepository(UserWorkspace)
    private readonly userWorkspaceRepository: Repository<UserWorkspace>,
  ) {}

  async generateAccessToken({
    userId,
    workspaceId,
    authProvider,
  }: Omit<
    AccessTokenJwtPayload,
    'type' | 'workspaceMemberId' | 'userWorkspaceId' | 'sub'
  >): Promise<AuthToken> {
    const expiresIn = this.twentyConfigService.get('ACCESS_TOKEN_EXPIRES_IN');

    const expiresAt = addMilliseconds(new Date().getTime(), ms(expiresIn));

    const user = await this.userRepository.findOne({
      where: { id: userId },
    });

    userValidator.assertIsDefinedOrThrow(
      user,
      new AuthException('User is not found', AuthExceptionCode.INVALID_INPUT),
    );

    let tokenWorkspaceMemberId: string | undefined;

    const workspace = await this.workspaceRepository.findOne({
      where: { id: workspaceId },
    });

    assertIsDefinedOrThrow(workspace, WorkspaceNotFoundDefaultError);

    if (isWorkspaceActiveOrSuspended(workspace)) {
      const workspaceMemberRepository =
        await this.twentyORMGlobalManager.getRepositoryForWorkspace<WorkspaceMemberWorkspaceEntity>(
          workspaceId,
          'workspaceMember',
        );

      const workspaceMember = await workspaceMemberRepository.findOne({
        where: {
          userId: user.id,
        },
      });

      assertIsDefinedOrThrow(
        workspaceMember,
        new AuthException(
          'User is not a member of the workspace',
          AuthExceptionCode.FORBIDDEN_EXCEPTION,
        ),
      );

      tokenWorkspaceMemberId = workspaceMember.id;
    }
    const userWorkspace = await this.userWorkspaceRepository.findOne({
      where: {
        userId: user.id,
        workspaceId,
      },
    });

    assertIsDefinedOrThrow(userWorkspace, UserWorkspaceNotFoundDefaultError);

    const jwtPayload: AccessTokenJwtPayload = {
      sub: user.id,
      userId: user.id,
      workspaceId,
      workspaceMemberId: tokenWorkspaceMemberId,
      userWorkspaceId: userWorkspace.id,
      type: JwtTokenTypeEnum.ACCESS,
      authProvider,
    };

    return {
      token: this.jwtWrapperService.sign(jwtPayload, {
        secret: this.jwtWrapperService.generateAppSecret(
          JwtTokenTypeEnum.ACCESS,
          workspaceId,
        ),
        expiresIn,
      }),
      expiresAt,
    };
  }

  async validateToken(token: string): Promise<AuthContext> {
    await this.jwtWrapperService.verifyJwtToken(token, JwtTokenTypeEnum.ACCESS);

    const decoded = this.jwtWrapperService.decode<AccessTokenJwtPayload>(token);

    const {
      user,
      apiKey,
      workspace,
      workspaceMemberId,
      userWorkspace,
      userWorkspaceId,
      authProvider,
    } = await this.jwtStrategy.validate(decoded);

    return {
      user,
      apiKey,
      workspace,
      userWorkspace,
      workspaceMemberId,
      userWorkspaceId,
      authProvider,
    };
  }

  async validateTokenByRequest(request: Request): Promise<AuthContext> {
    const token = this.jwtWrapperService.extractJwtFromRequest()(request);

    if (!token) {
      throw new AuthException(
        'Missing authentication token',
        AuthExceptionCode.FORBIDDEN_EXCEPTION,
      );
    }

    return this.validateToken(token);
  }
}
