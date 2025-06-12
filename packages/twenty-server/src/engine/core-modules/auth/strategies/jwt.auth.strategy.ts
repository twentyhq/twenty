import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { InjectRepository } from '@nestjs/typeorm';

import { Strategy } from 'passport-jwt';
import { Repository } from 'typeorm';

import {
  AuthException,
  AuthExceptionCode,
} from 'src/engine/core-modules/auth/auth.exception';
import {
  AuthContext,
  JwtPayload,
} from 'src/engine/core-modules/auth/types/auth-context.type';
import { JwtWrapperService } from 'src/engine/core-modules/jwt/services/jwt-wrapper.service';
import { UserWorkspace } from 'src/engine/core-modules/user-workspace/user-workspace.entity';
import { User } from 'src/engine/core-modules/user/user.entity';
import { Workspace } from 'src/engine/core-modules/workspace/workspace.entity';
import { TwentyORMGlobalManager } from 'src/engine/twenty-orm/twenty-orm-global.manager';
import { ApiKeyWorkspaceEntity } from 'src/modules/api-key/standard-objects/api-key.workspace-entity';

@Injectable()
export class JwtAuthStrategy extends PassportStrategy(Strategy, 'jwt') {
  constructor(
    private readonly jwtWrapperService: JwtWrapperService,
    private readonly twentyORMGlobalManager: TwentyORMGlobalManager,
    @InjectRepository(Workspace, 'core')
    private readonly workspaceRepository: Repository<Workspace>,
    @InjectRepository(User, 'core')
    private readonly userRepository: Repository<User>,
    @InjectRepository(UserWorkspace, 'core')
    private readonly userWorkspaceRepository: Repository<UserWorkspace>,
  ) {
    const jwtFromRequestFunction = jwtWrapperService.extractJwtFromRequest();
    // @ts-expect-error legacy noImplicitAny
    const secretOrKeyProviderFunction = async (_request, rawJwtToken, done) => {
      try {
        const decodedToken = jwtWrapperService.decode(
          rawJwtToken,
        ) as JwtPayload;
        const workspaceId = decodedToken.workspaceId;
        const secret = jwtWrapperService.generateAppSecret(
          'ACCESS',
          workspaceId,
        );

        done(null, secret);
      } catch (error) {
        done(error, null);
      }
    };

    super({
      jwtFromRequest: jwtFromRequestFunction,
      ignoreExpiration: false,
      secretOrKeyProvider: secretOrKeyProviderFunction,
    });
  }

  private async validateAPIKey(payload: JwtPayload): Promise<AuthContext> {
    let apiKey: ApiKeyWorkspaceEntity | null = null;

    const workspace = await this.workspaceRepository.findOneBy({
      id: payload['sub'],
    });

    if (!workspace) {
      throw new AuthException(
        'Workspace not found',
        AuthExceptionCode.WORKSPACE_NOT_FOUND,
      );
    }

    const apiKeyRepository =
      await this.twentyORMGlobalManager.getRepositoryForWorkspace<ApiKeyWorkspaceEntity>(
        workspace.id,
        'apiKey',
      );

    apiKey = await apiKeyRepository.findOne({
      where: {
        id: payload.jti,
      },
    });

    if (!apiKey || apiKey.revokedAt) {
      throw new AuthException(
        'This API Key is revoked',
        AuthExceptionCode.FORBIDDEN_EXCEPTION,
      );
    }

    return { apiKey, workspace };
  }

  private async validateAccessToken(payload: JwtPayload): Promise<AuthContext> {
    let user: User | null = null;
    const workspace = await this.workspaceRepository.findOneBy({
      id: payload['workspaceId'],
    });

    if (!workspace) {
      throw new AuthException(
        'Workspace not found',
        AuthExceptionCode.WORKSPACE_NOT_FOUND,
      );
    }

    user = await this.userRepository.findOne({
      where: { id: payload.sub },
    });
    if (!user) {
      throw new AuthException(
        'User not found',
        AuthExceptionCode.USER_NOT_FOUND,
      );
    }

    if (!payload.userWorkspaceId) {
      throw new AuthException(
        'UserWorkspace not found',
        AuthExceptionCode.USER_WORKSPACE_NOT_FOUND,
      );
    }

    const userWorkspace = await this.userWorkspaceRepository.findOne({
      where: {
        id: payload.userWorkspaceId,
      },
    });

    if (!userWorkspace) {
      throw new AuthException(
        'UserWorkspace not found',
        AuthExceptionCode.USER_WORKSPACE_NOT_FOUND,
      );
    }

    return { user, workspace, userWorkspaceId: userWorkspace.id };
  }

  async validate(payload: JwtPayload): Promise<AuthContext> {
    const workspaceMemberId = payload.workspaceMemberId;

    if (!payload.type && !payload.workspaceId) {
      return { ...(await this.validateAPIKey(payload)), workspaceMemberId };
    }

    if (payload.type === 'API_KEY') {
      return { ...(await this.validateAPIKey(payload)), workspaceMemberId };
    }

    return { ...(await this.validateAccessToken(payload)), workspaceMemberId };
  }
}
