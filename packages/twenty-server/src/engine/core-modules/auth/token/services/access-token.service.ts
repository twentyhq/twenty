import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { addMilliseconds } from 'date-fns';
import { Request } from 'express';
import ms from 'ms';
import { isWorkspaceActiveOrSuspended } from 'twenty-shared/workspace';
import { Repository } from 'typeorm';

import {
  AuthException,
  AuthExceptionCode,
} from 'src/engine/core-modules/auth/auth.exception';
import { AuthToken } from 'src/engine/core-modules/auth/dto/token.entity';
import { JwtAuthStrategy } from 'src/engine/core-modules/auth/strategies/jwt.auth.strategy';
import {
  AuthContext,
  JwtPayload,
} from 'src/engine/core-modules/auth/types/auth-context.type';
import { JwtWrapperService } from 'src/engine/core-modules/jwt/services/jwt-wrapper.service';
import { TwentyConfigService } from 'src/engine/core-modules/twenty-config/twenty-config.service';
import { UserWorkspace } from 'src/engine/core-modules/user-workspace/user-workspace.entity';
import { User } from 'src/engine/core-modules/user/user.entity';
import { userValidator } from 'src/engine/core-modules/user/user.validate';
import { Workspace } from 'src/engine/core-modules/workspace/workspace.entity';
import { workspaceValidator } from 'src/engine/core-modules/workspace/workspace.validate';
import { TwentyORMGlobalManager } from 'src/engine/twenty-orm/twenty-orm-global.manager';
import { WorkspaceMemberWorkspaceEntity } from 'src/modules/workspace-member/standard-objects/workspace-member.workspace-entity';

@Injectable()
export class AccessTokenService {
  constructor(
    private readonly jwtWrapperService: JwtWrapperService,
    private readonly jwtStrategy: JwtAuthStrategy,
    private readonly twentyConfigService: TwentyConfigService,
    @InjectRepository(User, 'core')
    private readonly userRepository: Repository<User>,
    @InjectRepository(Workspace, 'core')
    private readonly workspaceRepository: Repository<Workspace>,
    private readonly twentyORMGlobalManager: TwentyORMGlobalManager,
    @InjectRepository(UserWorkspace, 'core')
    private readonly userWorkspaceRepository: Repository<UserWorkspace>,
  ) {}

  async generateAccessToken(
    userId: string,
    workspaceId: string,
  ): Promise<AuthToken> {
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

    workspaceValidator.assertIsDefinedOrThrow(workspace);

    if (isWorkspaceActiveOrSuspended(workspace)) {
      const workspaceMemberRepository =
        await this.twentyORMGlobalManager.getRepositoryForWorkspace<WorkspaceMemberWorkspaceEntity>(
          workspaceId,
          'workspaceMember',
          false,
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
    const userWorkspace = await this.userWorkspaceRepository.findOne({
      where: {
        userId: user.id,
        workspaceId,
      },
    });

    const jwtPayload: JwtPayload = {
      sub: user.id,
      workspaceId,
      workspaceMemberId: tokenWorkspaceMemberId,
      userWorkspaceId: userWorkspace?.id,
    };

    return {
      token: this.jwtWrapperService.sign(jwtPayload, {
        secret: this.jwtWrapperService.generateAppSecret('ACCESS', workspaceId),
        expiresIn,
      }),
      expiresAt,
    };
  }

  async validateToken(token: string): Promise<AuthContext> {
    await this.jwtWrapperService.verifyWorkspaceToken(token, 'ACCESS');

    const decoded = await this.jwtWrapperService.decode(token);

    const { user, apiKey, workspace, workspaceMemberId, userWorkspaceId } =
      await this.jwtStrategy.validate(decoded as JwtPayload);

    return { user, apiKey, workspace, workspaceMemberId, userWorkspaceId };
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
