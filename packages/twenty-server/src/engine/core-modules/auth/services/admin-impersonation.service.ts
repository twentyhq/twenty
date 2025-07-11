import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { addMilliseconds } from 'date-fns';
import ms from 'ms';
import { Repository } from 'typeorm';

import {
  AuthException,
  AuthExceptionCode,
} from 'src/engine/core-modules/auth/auth.exception';
import { AuthToken } from 'src/engine/core-modules/auth/dto/token.entity';
import {
  AccessTokenJwtPayload,
  JwtTokenTypeEnum,
} from 'src/engine/core-modules/auth/types/auth-context.type';
import { JwtWrapperService } from 'src/engine/core-modules/jwt/services/jwt-wrapper.service';
import { TwentyConfigService } from 'src/engine/core-modules/twenty-config/twenty-config.service';
import { User } from 'src/engine/core-modules/user/user.entity';
import { userValidator } from 'src/engine/core-modules/user/user.validate';
import { Workspace } from 'src/engine/core-modules/workspace/workspace.entity';
import { workspaceValidator } from 'src/engine/core-modules/workspace/workspace.validate';

@Injectable()
export class AdminImpersonationService {
  constructor(
    private readonly jwtWrapperService: JwtWrapperService,
    private readonly twentyConfigService: TwentyConfigService,
    @InjectRepository(User, 'core')
    private readonly userRepository: Repository<User>,
    @InjectRepository(Workspace, 'core')
    private readonly workspaceRepository: Repository<Workspace>,
  ) {}

  async generateImpersonationToken(
    adminUserId: string,
    targetWorkspaceId: string,
  ): Promise<AuthToken> {
    // Validate admin user
    const adminUser = await this.userRepository.findOne({
      where: { id: adminUserId },
    });

    userValidator.assertIsDefinedOrThrow(
      adminUser,
      new AuthException('Admin user not found', AuthExceptionCode.INVALID_INPUT),
    );

    // Check if user is Super Admin
    if (!adminUser.canAccessFullAdminPanel) {
      throw new AuthException(
        'User is not authorized to impersonate',
        AuthExceptionCode.FORBIDDEN_EXCEPTION,
      );
    }

    // Validate target workspace
    const targetWorkspace = await this.workspaceRepository.findOne({
      where: { id: targetWorkspaceId },
    });

    workspaceValidator.assertIsDefinedOrThrow(
      targetWorkspace,
      new AuthException(
        'Target workspace not found',
        AuthExceptionCode.INVALID_INPUT,
      ),
    );

    const expiresIn = this.twentyConfigService.get('ACCESS_TOKEN_EXPIRES_IN');
    const expiresAt = addMilliseconds(new Date().getTime(), ms(expiresIn));

    // Create impersonation token payload
    const jwtPayload: AccessTokenJwtPayload = {
      sub: adminUserId,
      userId: adminUserId,
      workspaceId: targetWorkspaceId,
      workspaceMemberId: undefined, // Admin might not be a member
      userWorkspaceId: '', // Will be handled by middleware
      type: JwtTokenTypeEnum.ACCESS,
      // Impersonation specific fields
      isImpersonating: true,
      realUserId: adminUserId,
      impersonatedWorkspaceId: targetWorkspaceId,
    };

    return {
      token: this.jwtWrapperService.sign(jwtPayload, {
        secret: this.jwtWrapperService.generateAppSecret(
          JwtTokenTypeEnum.ACCESS,
          targetWorkspaceId,
        ),
        expiresIn,
      }),
      expiresAt,
    };
  }
}