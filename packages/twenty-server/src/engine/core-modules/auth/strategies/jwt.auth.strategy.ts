import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { InjectRepository } from '@nestjs/typeorm';

import { msg } from '@lingui/core/macro';
import { type SecretOrKeyProvider, Strategy } from 'passport-jwt';
import { assertIsDefinedOrThrow, isDefined } from 'twenty-shared/utils';
import { WorkspaceActivationStatus } from 'twenty-shared/workspace';
import { Repository } from 'typeorm';
import {
  AuthException,
  AuthExceptionCode,
} from 'src/engine/core-modules/auth/auth.exception';
import {
  type AuthContext,
  type AuthContextUser,
} from 'src/engine/core-modules/auth/types/auth-context.type';
import { type AccessTokenJwtPayload } from 'src/engine/core-modules/auth/types/access-token-jwt-payload.type';
import { type ApiKeyTokenJwtPayload } from 'src/engine/core-modules/auth/types/api-key-token-jwt-payload.type';
import { ApplicationAccessTokenJwtPayload } from 'src/engine/core-modules/auth/types/application-access-token-jwt-payload.type';
import { type JwtPayload } from 'src/engine/core-modules/auth/types/jwt-payload.type';
import { JwtTokenTypeEnum } from 'src/engine/core-modules/auth/types/jwt-token-type.enum';
import { type PlaygroundTokenJwtPayload } from 'src/engine/core-modules/auth/types/playground-token-jwt-payload.type';
import { type WorkspaceAgnosticTokenJwtPayload } from 'src/engine/core-modules/auth/types/workspace-agnostic-token-jwt-payload.type';
import { IMPERSONATION_DENIAL_EXCEPTION_MESSAGE_BY_REASON } from 'src/engine/core-modules/impersonation/constants/impersonation-denial-exception-message-by-reason.constant';
import { ImpersonationAuthorizationService } from 'src/engine/core-modules/impersonation/services/impersonation-authorization.service';
import { type FlatUserWorkspace } from 'src/engine/core-modules/user-workspace/types/flat-user-workspace.type';
import { CoreEntityCacheService } from 'src/engine/core-entity-cache/services/core-entity-cache.service';
import { JWT_SUPPORTED_VERIFY_ALGORITHMS } from 'src/engine/core-modules/jwt/constants/jwt-algorithm.constant';
import { JwtWrapperService } from 'src/engine/core-modules/jwt/services/jwt-wrapper.service';
import { UserWorkspaceEntity } from 'src/engine/core-modules/user-workspace/user-workspace.entity';
import { WorkspaceCacheService } from 'src/engine/workspace-cache/services/workspace-cache.service';

@Injectable()
export class JwtAuthStrategy extends PassportStrategy(Strategy, 'jwt') {
  constructor(
    private readonly jwtWrapperService: JwtWrapperService,
    @InjectRepository(UserWorkspaceEntity)
    private readonly userWorkspaceRepository: Repository<UserWorkspaceEntity>,
    private readonly workspaceCacheService: WorkspaceCacheService,
    private readonly coreEntityCacheService: CoreEntityCacheService,
    private readonly impersonationAuthorizationService: ImpersonationAuthorizationService,
  ) {
    const secretOrKeyProvider: SecretOrKeyProvider = (
      _request,
      rawJwtToken,
      done,
    ) => {
      jwtWrapperService.resolveVerificationKey(rawJwtToken).then(
        ({ key }) => done(null, key),
        (error) => done(error, undefined),
      );
    };

    super({
      jwtFromRequest: jwtWrapperService.extractJwtFromRequest(),
      ignoreExpiration: false,
      algorithms: [...JWT_SUPPORTED_VERIFY_ALGORITHMS],
      secretOrKeyProvider,
    });
  }

  private async validateAPIKey(
    payload: ApiKeyTokenJwtPayload,
  ): Promise<AuthContext> {
    const workspace = await this.coreEntityCacheService.get(
      'workspaceEntity',
      payload.sub,
    );

    assertIsDefinedOrThrow(
      workspace,
      new AuthException(
        'Workspace not found',
        AuthExceptionCode.WORKSPACE_NOT_FOUND,
      ),
    );

    const { apiKeyMap } = await this.workspaceCacheService.getOrRecompute(
      workspace.id,
      ['apiKeyMap'],
    );

    const apiKey = payload.jti ? apiKeyMap[payload.jti] : undefined;

    if (!apiKey || apiKey.revokedAt) {
      throw new AuthException(
        'This API Key is revoked',
        AuthExceptionCode.FORBIDDEN_EXCEPTION,
      );
    }

    if (new Date(apiKey.expiresAt) < new Date()) {
      throw new AuthException(
        'This API Key is expired',
        AuthExceptionCode.FORBIDDEN_EXCEPTION,
      );
    }

    return { apiKey, workspace, workspaceMemberId: payload.workspaceMemberId };
  }

  private async validateAccessToken(
    payload: AccessTokenJwtPayload | PlaygroundTokenJwtPayload,
  ): Promise<AuthContext> {
    let user: AuthContextUser | null = null;
    let context: AuthContext = {};

    const workspace = await this.coreEntityCacheService.get(
      'workspaceEntity',
      payload.workspaceId,
    );

    if (!isDefined(workspace)) {
      throw new AuthException(
        'Workspace not found',
        AuthExceptionCode.WORKSPACE_NOT_FOUND,
      );
    }

    // Only ACCESS tokens can carry impersonation; PLAYGROUND is always first-person.
    if (
      payload.type === JwtTokenTypeEnum.ACCESS &&
      payload.isImpersonating === true
    ) {
      context.impersonationContext = await this.validateImpersonation(payload);
    }

    const userId = payload.sub ?? payload.userId;

    if (!userId) {
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

    const userContext = await this.resolveUserContext({
      userId,
      userWorkspaceId: payload.userWorkspaceId,
      expectedWorkspaceId: workspace.id,
    });

    assertIsDefinedOrThrow(
      userContext,
      new AuthException(
        'User or user workspace not found',
        AuthExceptionCode.USER_NOT_FOUND,
        {
          userFriendlyMessage: msg`User does not have access to this workspace`,
        },
      ),
    );

    user = userContext.user;

    context = {
      ...context,
      user,
      workspace,
      authProvider: payload.authProvider,
      userWorkspace: userContext.userWorkspace,
      userWorkspaceId: userContext.userWorkspace.id,
      workspaceMemberId: payload.workspaceMemberId,
    };

    if (
      workspace.activationStatus ===
        WorkspaceActivationStatus.PENDING_CREATION ||
      workspace.activationStatus === WorkspaceActivationStatus.ONGOING_CREATION
    ) {
      return context;
    }

    const { flatWorkspaceMemberMaps } =
      await this.workspaceCacheService.getOrRecompute(workspace.id, [
        'flatWorkspaceMemberMaps',
      ]);

    const workspaceMemberId = flatWorkspaceMemberMaps.idByUserId[user.id];

    const workspaceMember = isDefined(workspaceMemberId)
      ? flatWorkspaceMemberMaps.byId[workspaceMemberId]
      : undefined;

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

    return {
      ...context,
      workspaceMember,
    };
  }

  private async resolveUserContext(params: {
    userId: string;
    userWorkspaceId: string;
    expectedWorkspaceId?: string;
  }): Promise<{
    user: AuthContextUser;
    userWorkspace: FlatUserWorkspace;
  } | null> {
    const user = await this.coreEntityCacheService.get('user', params.userId);

    if (!isDefined(user)) {
      return null;
    }

    const userWorkspace = await this.coreEntityCacheService.get(
      'userWorkspaceEntity',
      params.userWorkspaceId,
    );

    if (!isDefined(userWorkspace)) {
      return null;
    }

    if (
      isDefined(params.expectedWorkspaceId) &&
      userWorkspace.workspaceId !== params.expectedWorkspaceId
    ) {
      return null;
    }

    return { user, userWorkspace };
  }

  private async validateImpersonation(payload: AccessTokenJwtPayload) {
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

    // Impersonation validation requires relations -- not cached
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

    const authorizationResult =
      await this.impersonationAuthorizationService.checkImpersonationAuthorization(
        impersonatorUserWorkspace,
        impersonatedUserWorkspace,
      );

    if (!authorizationResult.allowed) {
      throw new AuthException(
        IMPERSONATION_DENIAL_EXCEPTION_MESSAGE_BY_REASON[
          authorizationResult.reason
        ],
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
    const user = await this.coreEntityCacheService.get('user', payload.sub);

    assertIsDefinedOrThrow(
      user,
      new AuthException('User not found', AuthExceptionCode.USER_NOT_FOUND),
    );

    return { user, authProvider: payload.authProvider };
  }

  private async validateApplicationToken(
    payload: ApplicationAccessTokenJwtPayload,
  ): Promise<AuthContext> {
    const workspace = await this.coreEntityCacheService.get(
      'workspaceEntity',
      payload.workspaceId,
    );

    if (!isDefined(workspace)) {
      throw new AuthException(
        'Workspace not found',
        AuthExceptionCode.WORKSPACE_NOT_FOUND,
      );
    }

    const applicationId = payload.sub ?? payload.applicationId;

    const { flatApplicationMaps } =
      await this.workspaceCacheService.getOrRecompute(workspace.id, [
        'flatApplicationMaps',
      ]);

    const application = flatApplicationMaps.byId[applicationId];

    if (!isDefined(application)) {
      throw new AuthException(
        'Application not found',
        AuthExceptionCode.APPLICATION_NOT_FOUND,
      );
    }

    const context: AuthContext = { application, workspace };

    if (payload.userId && payload.userWorkspaceId) {
      const userContext = await this.resolveUserContext({
        userId: payload.userId,
        userWorkspaceId: payload.userWorkspaceId,
        expectedWorkspaceId: workspace.id,
      });

      if (isDefined(userContext)) {
        context.user = userContext.user;
        context.userWorkspace = userContext.userWorkspace;
        context.userWorkspaceId = userContext.userWorkspace.id;

        const { flatWorkspaceMemberMaps } =
          await this.workspaceCacheService.getOrRecompute(workspace.id, [
            'flatWorkspaceMemberMaps',
          ]);

        const workspaceMemberId =
          flatWorkspaceMemberMaps.idByUserId[userContext.user.id];

        if (isDefined(workspaceMemberId)) {
          context.workspaceMemberId = workspaceMemberId;
          context.workspaceMember =
            flatWorkspaceMemberMaps.byId[workspaceMemberId];
        }
      }
    }

    return context;
  }

  private isLegacyApiKeyPayload(
    payload: JwtPayload,
  ): payload is ApiKeyTokenJwtPayload {
    return !payload.type && !('workspaceId' in payload);
  }

  async validate(payload: JwtPayload): Promise<AuthContext> {
    const context = await this.dispatch(payload);

    return {
      ...context,
      tokenType: this.isLegacyApiKeyPayload(payload)
        ? JwtTokenTypeEnum.API_KEY
        : payload.type,
    };
  }

  private async dispatch(payload: JwtPayload): Promise<AuthContext> {
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

    if (
      payload.type === JwtTokenTypeEnum.ACCESS ||
      payload.type === JwtTokenTypeEnum.PLAYGROUND
    ) {
      return await this.validateAccessToken(payload);
    }

    if (payload.type === JwtTokenTypeEnum.APPLICATION_ACCESS) {
      return await this.validateApplicationToken(payload);
    }

    throw new AuthException(
      'Invalid token',
      AuthExceptionCode.INVALID_JWT_TOKEN_TYPE,
    );
  }
}
