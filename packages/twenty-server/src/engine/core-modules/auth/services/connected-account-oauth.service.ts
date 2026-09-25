import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { isNonEmptyString } from '@sniptt/guards';
import { PermissionFlagType } from 'twenty-shared/constants';
import { isDefined } from 'twenty-shared/utils';
import { Repository } from 'typeorm';

import {
  AuthException,
  AuthExceptionCode,
} from 'src/engine/core-modules/auth/auth.exception';
import { TransientTokenService } from 'src/engine/core-modules/auth/token/services/transient-token.service';
import { UserWorkspaceEntity } from 'src/engine/core-modules/user-workspace/user-workspace.entity';
import { PermissionsService } from 'src/engine/metadata-modules/permissions/permissions.service';

@Injectable()
export class ConnectedAccountOAuthService {
  constructor(
    private readonly transientTokenService: TransientTokenService,
    private readonly permissionsService: PermissionsService,
    @InjectRepository(UserWorkspaceEntity)
    private readonly userWorkspaceRepository: Repository<UserWorkspaceEntity>,
  ) {}

  async verifyTransientTokenAndPermissions(transientToken: string) {
    const tokenPayload =
      await this.transientTokenService.verifyTransientToken(transientToken);
    const { userId, workspaceId, workspaceMemberId } = tokenPayload;

    if (
      !isNonEmptyString(userId) ||
      !isNonEmptyString(workspaceId) ||
      !isNonEmptyString(workspaceMemberId)
    ) {
      throw new AuthException(
        'Transient token is missing user or workspace information',
        AuthExceptionCode.INVALID_INPUT,
      );
    }

    const userWorkspace = await this.userWorkspaceRepository.findOneBy({
      userId,
      workspaceId,
    });

    if (!isDefined(userWorkspace)) {
      throw new AuthException(
        'User workspace not found',
        AuthExceptionCode.USER_WORKSPACE_NOT_FOUND,
      );
    }

    const canConnectAccount =
      await this.permissionsService.userHasWorkspaceSettingPermission({
        userWorkspaceId: userWorkspace.id,
        workspaceId,
        setting: PermissionFlagType.CONNECTED_ACCOUNTS,
        applicationId: undefined,
      });

    if (!canConnectAccount) {
      throw new AuthException(
        'You do not have permission to connect accounts',
        AuthExceptionCode.FORBIDDEN_EXCEPTION,
      );
    }

    return tokenPayload;
  }
}
