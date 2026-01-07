import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { InjectRepository } from '@nestjs/typeorm';

import { msg } from '@lingui/core/macro';
import { Strategy } from 'passport-jwt';
import { PermissionFlagType } from 'twenty-shared/constants';
import { assertIsDefinedOrThrow, isDefined } from 'twenty-shared/utils';
import { WorkspaceActivationStatus } from 'twenty-shared/workspace';
import { Repository } from 'typeorm';

import { ApiKeyEntity } from 'src/engine/core-modules/api-key/api-key.entity';
import { ApplicationEntity } from 'src/engine/core-modules/application/application.entity';
import {
  AuthException,
  AuthExceptionCode,
} from 'src/engine/core-modules/auth/auth.exception';
import {
  type AccessTokenJwtPayload,
  type ApiKeyTokenJwtPayload,
  ApplicationTokenJwtPayload,
  type AuthContext,
  type FileTokenJwtPayload,
  type JwtPayload,
  JwtTokenTypeEnum,
  type WorkspaceAgnosticTokenJwtPayload,
} from 'src/engine/core-modules/auth/types/auth-context.type';
import { JwtWrapperService } from 'src/engine/core-modules/jwt/services/jwt-wrapper.service';
import { UserWorkspaceEntity } from 'src/engine/core-modules/user-workspace/user-workspace.entity';
import { UserEntity } from 'src/engine/core-modules/user/user.entity';
import { userValidator } from 'src/engine/core-modules/user/user.validate';
import { WorkspaceEntity } from 'src/engine/core-modules/workspace/workspace.entity';
import { PermissionsService } from 'src/engine/metadata-modules/permissions/permissions.service';
import { GlobalWorkspaceOrmManager } from 'src/engine/twenty-orm/global-workspace-datasource/global-workspace-orm.manager';
import { buildSystemAuthContext } from 'src/engine/twenty-orm/utils/build-system-auth-context.util';
import { WorkspaceMemberWorkspaceEntity } from 'src/modules/workspace-member/standard-objects/workspace-member.workspace-entity';

@Injectable()
export class JwtAuthStrategy extends PassportStrategy(Strategy, 'jwt') {
  constructor(
    private readonly jwtWrapperService: JwtWrapperService,
    @InjectRepository(WorkspaceEntity)
    private readonly workspaceRepository: Repository<WorkspaceEntity>,
    @InjectRepository(ApplicationEntity)
    private readonly applicationRepository: Repository<ApplicationEntity>,
    @InjectRepository(UserEntity)
    private readonly userRepository: Repository<UserEntity>,
    @InjectRepository(UserWorkspaceEntity)
    private readonly userWorkspaceRepository: Repository<UserWorkspaceEntity>,
    @InjectRepository(ApiKeyEntity)
    private readonly apiKeyRepository: Repository<ApiKeyEntity>,
    private readonly permissionsService: PermissionsService,
    private readonly globalWorkspaceOrmManager: GlobalWorkspaceOrmManager,
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
          decodedToken.type === JwtTokenTypeEnum.WORKSPACE_AGNOSTIC
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
    let user: UserEntity | null = null;
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
      context.impersonationContext = await this.validateImpersonation(payload);
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

    if (!isDefined(user)) {
      throw new AuthException(
        'User not found',
        AuthExceptionCode.USER_NOT_FOUND,
      );
    }

    if (!payload.userWorkspaceId) {
      throw new AuthException(
        'UserWorkspaceEntity not found',
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
        'UserWorkspaceEntity not found',
        AuthExceptionCode.USER_WORKSPACE_NOT_FOUND,
        {
          userFriendlyMessage: msg`User does not have access to this workspace`,
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

    if (
      workspace.activationStatus ===
        WorkspaceActivationStatus.PENDING_CREATION ||
      workspace.activationStatus === WorkspaceActivationStatus.ONGOING_CREATION
    ) {
      return context;
    }

    const workspaceMember =
      await this.globalWorkspaceOrmManager.executeInWorkspaceContext(
        buildSystemAuthContext(workspace.id),
        async () => {
          const workspaceMemberRepository =
            await this.globalWorkspaceOrmManager.getRepository<WorkspaceMemberWorkspaceEntity>(
              workspace.id,
              'workspaceMember',
              { shouldBypassPermissionChecks: true },
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
              {
                userFriendlyMessage: msg`User is not a member of the workspace.`,
              },
            ),
          );

          return workspaceMember;
        },
      );

    return {
      ...context,
      workspaceMember,
    };
  }

  private async validateImpersonation(payload: AccessTokenJwtPayload) {
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
      impersonatedUserWorkspace.workspace.allowImpersonation === true;

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
  ): Promise<AuthContext> {
    const user = await this.userRepository.findOne({
      where: { id: payload.sub },
    });

    userValidator.assertIsDefinedOrThrow(
      user,
      new AuthException('User not found', AuthExceptionCode.USER_NOT_FOUND),
    );

    return { user, authProvider: payload.authProvider };
  }

  private async validateApplicationToken(
    payload: ApplicationTokenJwtPayload,
  ): Promise<AuthContext> {
    const workspace = await this.workspaceRepository.findOneBy({
      id: payload.workspaceId,
    });

    if (!isDefined(workspace)) {
      throw new AuthException(
        'Workspace not found',
        AuthExceptionCode.WORKSPACE_NOT_FOUND,
      );
    }

    const applicationId = payload.sub ?? payload.applicationId;

    const application = await this.applicationRepository.findOne({
      where: { id: applicationId },
    });

    if (!isDefined(application)) {
      throw new AuthException(
        'Application not found',
        AuthExceptionCode.APPLICATION_NOT_FOUND,
      );
    }

    return {
      application,
      workspace,
    };
  }

  private isLegacyApiKeyPayload(
    payload: JwtPayload,
  ): payload is ApiKeyTokenJwtPayload {
    return !payload.type && !('workspaceId' in payload);
  }

  async validate(payload: JwtPayload): Promise<AuthContext> {
    // Support legacy api keys
    if (
      payload.type === JwtTokenTypeEnum.API_KEY ||
      this.isLegacyApiKeyPayload(payload)
    ) {
      return await this.validateAPIKey(payload);
    }

    if (payload.type === JwtTokenTypeEnum.WORKSPACE_AGNOSTIC) {
      return await this.validateWorkspaceAgnosticToken(payload);
    }

    if (payload.type === JwtTokenTypeEnum.ACCESS) {
      return await this.validateAccessToken(payload);
    }

    if (payload.type === JwtTokenTypeEnum.APPLICATION) {
      return await this.validateApplicationToken(payload);
    }

    throw new AuthException(
      'Invalid token',
      AuthExceptionCode.INVALID_JWT_TOKEN_TYPE,
    );
  }
}
