import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { InjectRepository } from '@nestjs/typeorm';

import { t } from '@lingui/core/macro';
import { Strategy } from 'passport-jwt';
import { Repository } from 'typeorm';

import { ApiKey } from 'src/engine/core-modules/api-key/api-key.entity';
import {
  AuthException,
  AuthExceptionCode,
} from 'src/engine/core-modules/auth/auth.exception';
import {
  AccessTokenJwtPayload,
  ApiKeyTokenJwtPayload,
  AuthContext,
  FileTokenJwtPayload,
  JwtPayload,
  WorkspaceAgnosticTokenJwtPayload,
} from 'src/engine/core-modules/auth/types/auth-context.type';
import { JwtWrapperService } from 'src/engine/core-modules/jwt/services/jwt-wrapper.service';
import { UserWorkspace } from 'src/engine/core-modules/user-workspace/user-workspace.entity';
import { userWorkspaceValidator } from 'src/engine/core-modules/user-workspace/user-workspace.validate';
import { User } from 'src/engine/core-modules/user/user.entity';
import { userValidator } from 'src/engine/core-modules/user/user.validate';
import { Workspace } from 'src/engine/core-modules/workspace/workspace.entity';
import { workspaceValidator } from 'src/engine/core-modules/workspace/workspace.validate';
@Injectable()
export class JwtAuthStrategy extends PassportStrategy(Strategy, 'jwt') {
  constructor(
    private readonly jwtWrapperService: JwtWrapperService,
    @InjectRepository(Workspace, 'core')
    private readonly workspaceRepository: Repository<Workspace>,
    @InjectRepository(User, 'core')
    private readonly userRepository: Repository<User>,
    @InjectRepository(UserWorkspace, 'core')
    private readonly userWorkspaceRepository: Repository<UserWorkspace>,
    @InjectRepository(ApiKey, 'core')
    private readonly apiKeyRepository: Repository<ApiKey>,
  ) {
    const jwtFromRequestFunction = jwtWrapperService.extractJwtFromRequest();
    // @ts-expect-error legacy noImplicitAny
    const secretOrKeyProviderFunction = async (_request, rawJwtToken, done) => {
      try {
        const decodedToken = jwtWrapperService.decode<
          | FileTokenJwtPayload
          | AccessTokenJwtPayload
          | WorkspaceAgnosticTokenJwtPayload
        >(rawJwtToken);

        const appSecretBody =
          decodedToken.type === 'WORKSPACE_AGNOSTIC'
            ? decodedToken.userId
            : decodedToken.workspaceId;

        const secret = jwtWrapperService.generateAppSecret(
          decodedToken.type,
          appSecretBody,
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

  private async validateAPIKey(
    payload: ApiKeyTokenJwtPayload,
  ): Promise<AuthContext> {
    const workspace = await this.workspaceRepository.findOneBy({
      id: payload.sub,
    });

    workspaceValidator.assertIsDefinedOrThrow(
      workspace,
      new AuthException(
        'Workspace not found',
        AuthExceptionCode.WORKSPACE_NOT_FOUND,
      ),
    );

    const apiKey = await this.apiKeyRepository.findOne({
      where: {
        id: payload.jti,
        workspaceId: workspace.id,
      },
    });

    if (!apiKey || apiKey.revokedAt) {
      throw new AuthException(
        'This API Key is revoked',
        AuthExceptionCode.FORBIDDEN_EXCEPTION,
      );
    }

    return { apiKey, workspace, workspaceMemberId: payload.workspaceMemberId };
  }

  private async validateAccessToken(
    payload: AccessTokenJwtPayload,
  ): Promise<AuthContext> {
    let user: User | null = null;
    const workspace = await this.workspaceRepository.findOneBy({
      id: payload.workspaceId,
    });

    if (!workspace) {
      throw new AuthException(
        'Workspace not found',
        AuthExceptionCode.WORKSPACE_NOT_FOUND,
      );
    }

    const userId = payload.sub ?? payload.userId;

    if (!userId) {
      throw new AuthException(
        'User not found',
        AuthExceptionCode.USER_NOT_FOUND,
      );
    }

    user = await this.userRepository.findOne({
      where: { id: userId },
    });

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

    userWorkspaceValidator.assertIsDefinedOrThrow(
      userWorkspace,
      new AuthException(
        'UserWorkspace not found',
        AuthExceptionCode.USER_WORKSPACE_NOT_FOUND,
        {
          userFriendlyMessage: t`User does not have access to this workspace`,
        },
      ),
    );

    return {
      user,
      workspace,
      authProvider: payload.authProvider,
      userWorkspace,
      userWorkspaceId: userWorkspace.id,
      workspaceMemberId: payload.workspaceMemberId,
    };
  }

  private async validateWorkspaceAgnosticToken(
    payload: WorkspaceAgnosticTokenJwtPayload,
  ) {
    const user = await this.userRepository.findOne({
      where: { id: payload.sub },
    });

    userValidator.assertIsDefinedOrThrow(
      user,
      new AuthException('User not found', AuthExceptionCode.USER_NOT_FOUND),
    );

    return { user, authProvider: payload.authProvider };
  }

  private isLegacyApiKeyPayload(
    payload: JwtPayload,
  ): payload is ApiKeyTokenJwtPayload {
    return !payload.type && !('workspaceId' in payload);
  }

  async validate(payload: JwtPayload): Promise<AuthContext> {
    // Support legacy api keys
    if (payload.type === 'API_KEY' || this.isLegacyApiKeyPayload(payload)) {
      return await this.validateAPIKey(payload);
    }

    if (payload.type === 'WORKSPACE_AGNOSTIC') {
      return await this.validateWorkspaceAgnosticToken(payload);
    }

    // `!payload.type` is here to support legacy token
    if (payload.type === 'ACCESS' || !payload.type) {
      return await this.validateAccessToken(payload);
    }

    throw new AuthException(
      'Invalid token',
      AuthExceptionCode.INVALID_JWT_TOKEN_TYPE,
    );
  }
}
