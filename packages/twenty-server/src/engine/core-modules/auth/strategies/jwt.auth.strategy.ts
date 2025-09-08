import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { InjectRepository } from '@nestjs/typeorm';

import { t } from '@lingui/core/macro';
import { isUUID } from 'class-validator';
import { Strategy } from 'passport-jwt';
import { Repository } from 'typeorm';

import { ApiKey } from 'src/engine/core-modules/api-key/api-key.entity';
import {
  AuthException,
  AuthExceptionCode,
} from 'src/engine/core-modules/auth/auth.exception';
import { ImpersonationTokenTypeEnum } from 'src/engine/core-modules/auth/enum/impersonation-type.enum';
import {
  type AccessTokenJwtPayload,
  type ApiKeyTokenJwtPayload,
  type AuthContext,
  type FileTokenJwtPayload,
  type JwtPayload,
  type WorkspaceAgnosticTokenJwtPayload,
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
    @InjectRepository(Workspace)
    private readonly workspaceRepository: Repository<Workspace>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(UserWorkspace)
    private readonly userWorkspaceRepository: Repository<UserWorkspace>,
    @InjectRepository(ApiKey)
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
    const userId = payload.sub ?? payload.userId;

    if (!payload.workspaceId || !isUUID(payload.workspaceId)) {
      throw new AuthException(
        'Invalid token',
        AuthExceptionCode.FORBIDDEN_EXCEPTION,
      );
    }

    if (!userId || !isUUID(userId)) {
      throw new AuthException(
        'Invalid token',
        AuthExceptionCode.FORBIDDEN_EXCEPTION,
      );
    }

    if (!payload.userWorkspaceId || !isUUID(payload.userWorkspaceId)) {
      throw new AuthException(
        'UserWorkspace not found',
        AuthExceptionCode.USER_WORKSPACE_NOT_FOUND,
      );
    }

    if (payload.isImpersonating === true) {
      if (
        payload.impersonationType !== ImpersonationTokenTypeEnum.WORKSPACE &&
        payload.impersonationType !== ImpersonationTokenTypeEnum.SERVER
      ) {
        throw new AuthException(
          'Invalid impersonation token',
          AuthExceptionCode.FORBIDDEN_EXCEPTION,
        );
      }

      if (
        !payload.originalUserWorkspaceId ||
        !isUUID(payload.originalUserWorkspaceId) ||
        !payload.impersonatorUserWorkspaceId ||
        !isUUID(payload.impersonatorUserWorkspaceId)
      ) {
        throw new AuthException(
          'Invalid impersonation token',
          AuthExceptionCode.FORBIDDEN_EXCEPTION,
        );
      }

      if (payload.impersonationType === ImpersonationTokenTypeEnum.WORKSPACE) {
        if (payload.originalUserWorkspaceId !== payload.userWorkspaceId) {
          throw new AuthException(
            'Invalid impersonation token',
            AuthExceptionCode.FORBIDDEN_EXCEPTION,
          );
        }

        if (
          payload.originalUserWorkspaceId ===
          payload.impersonatorUserWorkspaceId
        ) {
          throw new AuthException(
            'Invalid impersonation token',
            AuthExceptionCode.FORBIDDEN_EXCEPTION,
          );
        }
      }
    }

    const userWorkspace = await this.userWorkspaceRepository.findOne({
      where: { id: payload.userWorkspaceId },
      relations: ['user', 'workspace'],
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

    const workspace = userWorkspace.workspace;
    const user = userWorkspace.user;

    if (!workspace || workspace.id !== payload.workspaceId) {
      throw new AuthException(
        'Workspace not found',
        AuthExceptionCode.WORKSPACE_NOT_FOUND,
      );
    }

    const context: AuthContext = {
      user,
      workspace,
      authProvider: payload.authProvider,
      userWorkspace,
      userWorkspaceId: userWorkspace.id,
      workspaceMemberId: payload.workspaceMemberId,
    };

    // this validate and attach impersonation metadata if present
    if (payload.isImpersonating === true) {
      if (
        payload.impersonationType !== ImpersonationTokenTypeEnum.WORKSPACE &&
        payload.impersonationType !== ImpersonationTokenTypeEnum.SERVER
      ) {
        throw new AuthException(
          'Invalid impersonation token',
          AuthExceptionCode.FORBIDDEN_EXCEPTION,
        );
      }

      if (payload.impersonationType === ImpersonationTokenTypeEnum.WORKSPACE) {
        // this ensure workspace policy allows impersonation
        if (workspace.allowImpersonation !== true) {
          throw new AuthException(
            'Impersonation not allowed for this workspace',
            AuthExceptionCode.FORBIDDEN_EXCEPTION,
          );
        }

        if (payload.originalUserWorkspaceId !== userWorkspace.id) {
          throw new AuthException(
            'Invalid impersonation token',
            AuthExceptionCode.FORBIDDEN_EXCEPTION,
          );
        }
        if ((user?.id as string) !== (payload.sub ?? payload.userId)) {
          throw new AuthException(
            'Invalid impersonation token',
            AuthExceptionCode.FORBIDDEN_EXCEPTION,
          );
        }
      }

      context.impersonationContext = {
        impersonationType: payload.impersonationType,
        impersonatorUserWorkspaceId: payload.impersonatorUserWorkspaceId,
        originalUserWorkspaceId: payload.originalUserWorkspaceId,
      };
    }

    return context;
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
