import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { addMilliseconds } from 'date-fns';
import { Request } from 'express';
import ms from 'ms';
import { ExtractJwt } from 'passport-jwt';
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
import { EnvironmentService } from 'src/engine/core-modules/environment/environment.service';
import { JwtWrapperService } from 'src/engine/core-modules/jwt/services/jwt-wrapper.service';
import { User } from 'src/engine/core-modules/user/user.entity';
import { WorkspaceActivationStatus } from 'src/engine/core-modules/workspace/workspace.entity';
import { TwentyORMGlobalManager } from 'src/engine/twenty-orm/twenty-orm-global.manager';
import { WorkspaceMemberWorkspaceEntity } from 'src/modules/workspace-member/standard-objects/workspace-member.workspace-entity';

@Injectable()
export class AccessTokenService {
  constructor(
    private readonly jwtWrapperService: JwtWrapperService,
    private readonly jwtStrategy: JwtAuthStrategy,
    private readonly environmentService: EnvironmentService,
    @InjectRepository(User, 'core')
    private readonly userRepository: Repository<User>,
    private readonly twentyORMGlobalManager: TwentyORMGlobalManager,
  ) {}

  async generateAccessToken(
    userId: string,
    workspaceId: string,
  ): Promise<AuthToken> {
    const expiresIn = this.environmentService.get('ACCESS_TOKEN_EXPIRES_IN');

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
      token: this.jwtWrapperService.sign(jwtPayload, {
        secret: this.jwtWrapperService.generateAppSecret('ACCESS', workspaceId),
      }),
      expiresAt,
    };
  }

  async validateToken(token: string): Promise<AuthContext> {
    await this.jwtWrapperService.verifyWorkspaceToken(token, 'ACCESS');

    const decoded = await this.jwtWrapperService.decode(token);

    const { user, apiKey, workspace, workspaceMemberId } =
      await this.jwtStrategy.validate(decoded as JwtPayload);

    return { user, apiKey, workspace, workspaceMemberId };
  }

  async validateTokenByRequest(request: Request): Promise<AuthContext> {
    const token = ExtractJwt.fromAuthHeaderAsBearerToken()(request);

    if (!token) {
      throw new AuthException(
        'missing authentication token',
        AuthExceptionCode.FORBIDDEN_EXCEPTION,
      );
    }

    return this.validateToken(token);
  }
}
