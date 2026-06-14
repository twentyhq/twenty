import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { msg } from '@lingui/core/macro';
import { addMilliseconds } from 'date-fns';
import { type Request } from 'express';
import ms from 'ms';
import { assertIsDefinedOrThrow } from 'twenty-shared/utils';
import { isWorkspaceActiveOrSuspended } from 'twenty-shared/workspace';
import { Repository } from 'typeorm';

import {
  AuthException,
  AuthExceptionCode,
} from 'src/engine/core-modules/auth/auth.exception';
import { type AuthToken } from 'src/engine/core-modules/auth/dto/auth-token.dto';
import { JwtAuthStrategy } from 'src/engine/core-modules/auth/strategies/jwt.auth.strategy';
import { type AuthContext } from 'src/engine/core-modules/auth/types/auth-context.type';
import { type AccessTokenJwtPayload } from 'src/engine/core-modules/auth/types/access-token-jwt-payload.type';
import { JwtTokenTypeEnum } from 'src/engine/core-modules/auth/types/jwt-token-type.enum';
import { type PlaygroundTokenJwtPayload } from 'src/engine/core-modules/auth/types/playground-token-jwt-payload.type';
import { JwtWrapperService } from 'src/engine/core-modules/jwt/services/jwt-wrapper.service';
import { TwentyConfigService } from 'src/engine/core-modules/twenty-config/twenty-config.service';
import { UserWorkspaceEntity } from 'src/engine/core-modules/user-workspace/user-workspace.entity';
import { UserWorkspaceNotFoundDefaultError } from 'src/engine/core-modules/user-workspace/user-workspace.exception';
import { UserEntity } from 'src/engine/core-modules/user/user.entity';
import { userValidator } from 'src/engine/core-modules/user/user.validate';
import { WorkspaceEntity } from 'src/engine/core-modules/workspace/workspace.entity';
import { WorkspaceNotFoundDefaultError } from 'src/engine/core-modules/workspace/workspace.exception';
import { GlobalWorkspaceOrmManager } from 'src/engine/twenty-orm/global-workspace-datasource/global-workspace-orm.manager';
import { buildSystemAuthContext } from 'src/engine/twenty-orm/utils/build-system-auth-context.util';
import { WorkspaceMemberWorkspaceEntity } from 'src/modules/workspace-member/standard-objects/workspace-member.workspace-entity';

@Injectable()
export class AccessTokenService {
  constructor(
    private readonly jwtWrapperService: JwtWrapperService,
    private readonly jwtStrategy: JwtAuthStrategy,
    private readonly twentyConfigService: TwentyConfigService,
    @InjectRepository(UserEntity)
    private readonly userRepository: Repository<UserEntity>,
    @InjectRepository(WorkspaceEntity)
    private readonly workspaceRepository: Repository<WorkspaceEntity>,
    private readonly globalWorkspaceOrmManager: GlobalWorkspaceOrmManager,
    @InjectRepository(UserWorkspaceEntity)
    private readonly userWorkspaceRepository: Repository<UserWorkspaceEntity>,
  ) {}

  private async resolveTokenSubject(
    userId: string,
    workspaceId: string,
  ): Promise<{
    user: UserEntity;
    workspace: WorkspaceEntity;
    userWorkspace: UserWorkspaceEntity;
    workspaceMemberId: string | undefined;
  }> {
    const [user, workspace, userWorkspace] = await Promise.all([
      this.userRepository.findOne({ where: { id: userId } }),
      this.workspaceRepository.findOne({ where: { id: workspaceId } }),
      this.userWorkspaceRepository.findOne({
        where: { userId, workspaceId },
      }),
    ]);

    userValidator.assertIsDefinedOrThrow(
      user,
      new AuthException('User is not found', AuthExceptionCode.INVALID_INPUT),
    );
    assertIsDefinedOrThrow(workspace, WorkspaceNotFoundDefaultError);
    assertIsDefinedOrThrow(userWorkspace, UserWorkspaceNotFoundDefaultError);

    let workspaceMemberId: string | undefined;

    if (isWorkspaceActiveOrSuspended(workspace)) {
      const authContext = buildSystemAuthContext(workspaceId);

      workspaceMemberId =
        await this.globalWorkspaceOrmManager.executeInWorkspaceContext(
          async () => {
            const workspaceMemberRepository =
              await this.globalWorkspaceOrmManager.getRepository<WorkspaceMemberWorkspaceEntity>(
                workspaceId,
                'workspaceMember',
                { shouldBypassPermissionChecks: true },
              );

            const workspaceMember = await workspaceMemberRepository.findOne({
              where: { userId: user.id },
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

            return workspaceMember.id;
          },
          authContext,
        );
    }

    return { user, workspace, userWorkspace, workspaceMemberId };
  }

  async generateAccessToken({
    userId,
    workspaceId,
    authProvider,
    isImpersonating,
    impersonatorUserWorkspaceId,
    impersonatedUserWorkspaceId,
  }: Omit<
    AccessTokenJwtPayload,
    'type' | 'workspaceMemberId' | 'userWorkspaceId' | 'sub'
  >): Promise<AuthToken> {
    const expiresIn = this.twentyConfigService.get('ACCESS_TOKEN_EXPIRES_IN');
    const expiresAt = addMilliseconds(new Date().getTime(), ms(expiresIn));

    const { user, userWorkspace, workspaceMemberId } =
      await this.resolveTokenSubject(userId, workspaceId);

    const jwtPayload: AccessTokenJwtPayload = {
      sub: user.id,
      userId: user.id,
      workspaceId,
      workspaceMemberId,
      userWorkspaceId: userWorkspace.id,
      type: JwtTokenTypeEnum.ACCESS,
      authProvider,
      isImpersonating: isImpersonating === true,
      impersonatorUserWorkspaceId:
        isImpersonating === true ? impersonatorUserWorkspaceId : undefined,
      impersonatedUserWorkspaceId:
        isImpersonating === true ? impersonatedUserWorkspaceId : undefined,
    };

    const token = await this.jwtWrapperService.signAsyncOrThrow(jwtPayload, {
      expiresIn,
    });

    return { token, expiresAt };
  }

  async generatePlaygroundToken({
    userId,
    workspaceId,
    authProvider,
  }: Pick<
    PlaygroundTokenJwtPayload,
    'userId' | 'workspaceId' | 'authProvider'
  >): Promise<AuthToken> {
    const expiresIn = this.twentyConfigService.get(
      'PLAYGROUND_TOKEN_EXPIRES_IN',
    );
    const expiresAt = addMilliseconds(new Date().getTime(), ms(expiresIn));

    const { user, userWorkspace, workspaceMemberId } =
      await this.resolveTokenSubject(userId, workspaceId);

    const jwtPayload: PlaygroundTokenJwtPayload = {
      sub: user.id,
      userId: user.id,
      workspaceId,
      workspaceMemberId,
      userWorkspaceId: userWorkspace.id,
      type: JwtTokenTypeEnum.PLAYGROUND,
      authProvider,
    };

    const token = await this.jwtWrapperService.signAsyncOrThrow(jwtPayload, {
      expiresIn,
    });

    return { token, expiresAt };
  }

  async validateToken(token: string): Promise<AuthContext> {
    await this.jwtWrapperService.verifyJwtToken(token);

    const decoded = this.jwtWrapperService.decode<AccessTokenJwtPayload>(token);

    const context = await this.jwtStrategy.validate(decoded);

    return context;
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
