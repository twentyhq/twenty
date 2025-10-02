import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { InjectRepository } from '@nestjs/typeorm';

import { t } from '@lingui/core/macro';
import { Strategy } from 'passport-jwt';
import { assertIsDefinedOrThrow, isDefined } from 'twenty-shared/utils';
import { Repository } from 'typeorm';

import { ApiKey } from 'src/engine/core-modules/api-key/api-key.entity';
import {
  AuthException,
  AuthExceptionCode,
} from 'src/engine/core-modules/auth/auth.exception';
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
import { User } from 'src/engine/core-modules/user/user.entity';
import { userValidator } from 'src/engine/core-modules/user/user.validate';
import { Workspace } from 'src/engine/core-modules/workspace/workspace.entity';
import { PermissionFlagType } from 'src/engine/metadata-modules/permissions/constants/permission-flag-type.constants';
import { PermissionsService } from 'src/engine/metadata-modules/permissions/permissions.service';
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
    private readonly permissionsService: PermissionsService,
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

    assertIsDefinedOrThrow(
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
    let context: AuthContext = {};

    const workspace = await this.workspaceRepository.findOneBy({
      id: payload.workspaceId,
    });

    if (!isDefined(workspace)) {
      throw new AuthException(
        'Workspace not found',
        AuthExceptionCode.WORKSPACE_NOT_FOUND,
      );
    }

    if (payload.isImpersonating === true) {
      context.impersonationContext = await this.validateImpersonation(
        payload,
        workspace,
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
      where: { id: payload.userWorkspaceId },
      relations: ['user', 'workspace'],
    });

    assertIsDefinedOrThrow(
      userWorkspace,
      new AuthException(
        'UserWorkspace not found',
        AuthExceptionCode.USER_WORKSPACE_NOT_FOUND,
        {
          userFriendlyMessage: t`User does not have access to this workspace`,
        },
      ),
    );

    context = {
      ...context,
      user,
      workspace,
      authProvider: payload.authProvider,
      userWorkspace,
      userWorkspaceId: userWorkspace.id,
      workspaceMemberId: payload.workspaceMemberId,
    };

    return context;
  }

  private async validateImpersonation(
    payload: AccessTokenJwtPayload,
    workspace: Workspace,
  ) {
    // Validate required impersonation fields
    if (
      !payload.impersonatorUserWorkspaceId ||
      !payload.impersonatedUserWorkspaceId
    ) {
      throw new AuthException(
        'Invalid or missing user workspace ID in impersonation token',
        AuthExceptionCode.FORBIDDEN_EXCEPTION,
      );
    }

    if (payload.impersonatedUserWorkspaceId !== payload.userWorkspaceId) {
      throw new AuthException(
        'Token user workspace ID does not match impersonated user workspace ID',
        AuthExceptionCode.FORBIDDEN_EXCEPTION,
      );
    }

    if (
      payload.impersonatedUserWorkspaceId ===
      payload.impersonatorUserWorkspaceId
    ) {
      throw new AuthException(
        'User cannot impersonate themselves',
        AuthExceptionCode.FORBIDDEN_EXCEPTION,
      );
    }

    const impersonatorUserWorkspace =
      await this.userWorkspaceRepository.findOne({
        where: { id: payload.impersonatorUserWorkspaceId },
        relations: ['user', 'workspace'],
      });

    const impersonatedUserWorkspace =
      await this.userWorkspaceRepository.findOne({
        where: { id: payload.impersonatedUserWorkspaceId },
        relations: ['user', 'workspace'],
      });

    if (
      !isDefined(impersonatorUserWorkspace) ||
      !isDefined(impersonatedUserWorkspace)
    ) {
      throw new AuthException(
        'Invalid impersonation token, cannot find impersonator or impersonated user workspace',
        AuthExceptionCode.USER_WORKSPACE_NOT_FOUND,
      );
    }

    const isServerLevelImpersonation =
      impersonatorUserWorkspace.workspace.id !==
      impersonatedUserWorkspace.workspace.id;

    const hasServerLevelImpersonatePermission =
      impersonatorUserWorkspace.user.canImpersonate === true &&
      workspace.allowImpersonation === true;

    if (isServerLevelImpersonation) {
      if (!hasServerLevelImpersonatePermission)
        throw new AuthException(
          'Server level impersonation not allowed',
          AuthExceptionCode.FORBIDDEN_EXCEPTION,
        );

      return {
        impersonatorUserWorkspaceId: payload.impersonatorUserWorkspaceId,
        impersonatedUserWorkspaceId: payload.impersonatedUserWorkspaceId,
      };
    }

    const hasWorkspaceLevelImpersonatePermission =
      await this.permissionsService.userHasWorkspaceSettingPermission({
        userWorkspaceId: impersonatorUserWorkspace.id,
        setting: PermissionFlagType.IMPERSONATE,
        workspaceId: impersonatedUserWorkspace.workspace.id,
      });

    if (!hasWorkspaceLevelImpersonatePermission) {
      throw new AuthException(
        'Impersonation not allowed',
        AuthExceptionCode.FORBIDDEN_EXCEPTION,
      );
    }

    return {
      impersonatorUserWorkspaceId: payload.impersonatorUserWorkspaceId,
      impersonatedUserWorkspaceId: payload.impersonatedUserWorkspaceId,
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
