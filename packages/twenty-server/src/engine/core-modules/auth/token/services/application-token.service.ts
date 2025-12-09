import { InjectRepository } from '@nestjs/typeorm';
import { Injectable } from '@nestjs/common';

import { Repository } from 'typeorm';
import { addMilliseconds } from 'date-fns';
import { assertIsDefinedOrThrow, isDefined } from 'twenty-shared/utils';
import { msg } from '@lingui/core/macro';
import ms from 'ms';

import { JwtWrapperService } from 'src/engine/core-modules/jwt/services/jwt-wrapper.service';
import { WorkspaceEntity } from 'src/engine/core-modules/workspace/workspace.entity';
import {
  ApplicationTokenJwtPayload,
  JwtTokenTypeEnum,
} from 'src/engine/core-modules/auth/types/auth-context.type';
import { AuthToken } from 'src/engine/core-modules/auth/dto/auth-token.dto';
import { WorkspaceNotFoundDefaultError } from 'src/engine/core-modules/workspace/workspace.exception';
import { UserWorkspaceNotFoundDefaultError } from 'src/engine/core-modules/user-workspace/user-workspace.exception';
import { userValidator } from 'src/engine/core-modules/user/user.validate';
import {
  AuthException,
  AuthExceptionCode,
} from 'src/engine/core-modules/auth/auth.exception';
import { UserEntity } from 'src/engine/core-modules/user/user.entity';
import { UserWorkspaceEntity } from 'src/engine/core-modules/user-workspace/user-workspace.entity';
import { ApplicationEntity } from 'src/engine/core-modules/application/application.entity';
import { ApplicationNotFoundDefaultError } from 'src/engine/core-modules/application/application.exception';
import { WorkspaceMemberWorkspaceEntity } from 'src/modules/workspace-member/standard-objects/workspace-member.workspace-entity';
import { TwentyORMGlobalManager } from 'src/engine/twenty-orm/twenty-orm-global.manager';

@Injectable()
export class ApplicationTokenService {
  constructor(
    private readonly jwtWrapperService: JwtWrapperService,
    private readonly twentyORMGlobalManager: TwentyORMGlobalManager,
    @InjectRepository(UserEntity)
    private readonly userRepository: Repository<UserEntity>,
    @InjectRepository(WorkspaceEntity)
    private readonly workspaceRepository: Repository<WorkspaceEntity>,
    @InjectRepository(UserWorkspaceEntity)
    private readonly userWorkspaceRepository: Repository<UserWorkspaceEntity>,
    @InjectRepository(ApplicationEntity)
    private readonly applicationRepository: Repository<ApplicationEntity>,
  ) {}

  async generateApplicationToken({
    workspaceId,
    userId,
    applicationId,
    expiresInSeconds,
  }: Omit<ApplicationTokenJwtPayload, 'type' | 'sub'> & {
    expiresInSeconds: number;
  }): Promise<AuthToken> {
    const expiresIn = `${expiresInSeconds}s`;

    const expiresAt = addMilliseconds(new Date().getTime(), ms(expiresIn));

    const workspace = await this.workspaceRepository.findOne({
      where: { id: workspaceId },
    });

    assertIsDefinedOrThrow(workspace, WorkspaceNotFoundDefaultError);

    const application = await this.applicationRepository.findOne({
      where: { id: applicationId },
    });

    assertIsDefinedOrThrow(application, ApplicationNotFoundDefaultError);

    let userPayload = {};

    if (isDefined(userId)) {
      const user = await this.userRepository.findOne({
        where: { id: userId },
      });

      userValidator.assertIsDefinedOrThrow(
        user,
        new AuthException('User is not found', AuthExceptionCode.INVALID_INPUT),
      );

      const userWorkspace = await this.userWorkspaceRepository.findOne({
        where: {
          userId: user.id,
          workspaceId,
        },
      });

      assertIsDefinedOrThrow(userWorkspace, UserWorkspaceNotFoundDefaultError);

      const workspaceMemberRepository =
        await this.twentyORMGlobalManager.getRepositoryForWorkspace<WorkspaceMemberWorkspaceEntity>(
          workspaceId,
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

      userPayload = {
        userId: user.id,
        workspaceMemberId: workspaceMember.id,
      };
    }

    const jwtPayload: ApplicationTokenJwtPayload = {
      ...userPayload,
      sub: applicationId,
      applicationId,
      workspaceId,
      type: JwtTokenTypeEnum.APPLICATION,
    };

    return {
      token: this.jwtWrapperService.sign(jwtPayload, {
        secret: this.jwtWrapperService.generateAppSecret(
          JwtTokenTypeEnum.APPLICATION,
          workspaceId,
        ),
        expiresIn,
      }),
      expiresAt,
    };
  }
}
