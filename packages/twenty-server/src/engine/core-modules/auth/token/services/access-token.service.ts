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
  AccessTokenJwtPayload,
  AuthContext,
  JwtTokenTypeEnum,
} from 'src/engine/core-modules/auth/types/auth-context.type';
import { JwtWrapperService } from 'src/engine/core-modules/jwt/services/jwt-wrapper.service';
import { TwentyConfigService } from 'src/engine/core-modules/twenty-config/twenty-config.service';
import { UserWorkspace } from 'src/engine/core-modules/user-workspace/user-workspace.entity';
import { userWorkspaceValidator } from 'src/engine/core-modules/user-workspace/user-workspace.validate';
import { User } from 'src/engine/core-modules/user/user.entity';
import { userValidator } from 'src/engine/core-modules/user/user.validate';
import { Workspace } from 'src/engine/core-modules/workspace/workspace.entity';
import { workspaceValidator } from 'src/engine/core-modules/workspace/workspace.validate';
import { TwentyORMGlobalManager } from 'src/engine/twenty-orm/twenty-orm-global.manager';
import { WorkspaceMemberWorkspaceEntity } from 'src/modules/workspace-member/standard-objects/workspace-member.workspace-entity';
import { RoleEntity } from 'src/engine/metadata-modules/role/role.entity';
import { UserRoleService } from 'src/engine/metadata-modules/user-role/user-role.service';
import { ADMIN_ROLE_LABEL } from 'src/engine/metadata-modules/permissions/constants/admin-role-label.constants';

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
    @InjectRepository(RoleEntity, 'core')
    private readonly roleRepository: Repository<RoleEntity>,
    private readonly userRoleService: UserRoleService,
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

    workspaceValidator.assertIsDefinedOrThrow(workspace);

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

      if (!workspaceMember) {
        // Super Admin can access any workspace without being a member
        if (user.canAccessFullAdminPanel) {
          // For Super Admin, we don't set tokenWorkspaceMemberId since they're not a workspace member
          tokenWorkspaceMemberId = undefined;
        } else {
          throw new AuthException(
            'User is not a member of the workspace',
            AuthExceptionCode.FORBIDDEN_EXCEPTION,
          );
        }
      } else {
        tokenWorkspaceMemberId = workspaceMember.id;
      }
    }
    let userWorkspace = await this.userWorkspaceRepository.findOne({
      where: {
        userId: user.id,
        workspaceId,
      },
    });

    // Super Admin might not have a UserWorkspace record, so we need to handle this case
    if (!userWorkspace) {
      // If user is Super Admin, we can create a UserWorkspace record for them
      if (user.canAccessFullAdminPanel) {
        // Create a UserWorkspace record for Super Admin if it doesn't exist
        // This ensures Super Admin can access any workspace without explicit membership
        const newUserWorkspace = this.userWorkspaceRepository.create({
          userId: user.id,
          workspaceId,
        });
        
        userWorkspace = await this.userWorkspaceRepository.save(newUserWorkspace);

        const adminRole = await this.roleRepository.findOne({
          where: { workspaceId, label: ADMIN_ROLE_LABEL },
        });

        if (adminRole) {
          await this.userRoleService.assignRoleToUserWorkspace({
            workspaceId,
            userWorkspaceId: userWorkspace.id,
            roleId: adminRole.id,
          });
        }
      } else {
        userWorkspaceValidator.assertIsDefinedOrThrow(userWorkspace);
      }
    }

    userWorkspaceValidator.assertIsDefinedOrThrow(userWorkspace);

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
