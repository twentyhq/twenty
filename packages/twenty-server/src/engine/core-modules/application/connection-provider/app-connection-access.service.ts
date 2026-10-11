import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { msg } from '@lingui/core/macro';
import { ConnectedAccountProvider } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';
import { type EntityManager, Repository } from 'typeorm';

import { ConnectionProviderExceptionCode } from 'src/engine/core-modules/application/connection-provider/connection-provider-exception-code.enum';
import { ConnectionProviderEntity } from 'src/engine/core-modules/application/connection-provider/connection-provider.entity';
import { ConnectionProviderException } from 'src/engine/core-modules/application/connection-provider/connection-provider.exception';
import { UserWorkspaceEntity } from 'src/engine/core-modules/user-workspace/user-workspace.entity';
import {
  ConnectedAccountEntity,
  type ConnectedAccountVisibility,
} from 'src/engine/metadata-modules/connected-account/entities/connected-account.entity';
import { buildConnectedAccountUsableByCallerWhere } from 'src/engine/metadata-modules/connected-account/utils/build-connected-account-usable-by-caller-where.util';
import { getConnectedAccountAdministrationPermissionFlag } from 'src/engine/metadata-modules/connected-account/utils/get-connected-account-administration-permission-flag.util';
import {
  PermissionsException,
  PermissionsExceptionCode,
  PermissionsExceptionMessage,
} from 'src/engine/metadata-modules/permissions/permissions.exception';
import { PermissionsService } from 'src/engine/metadata-modules/permissions/permissions.service';
import { InjectWorkspaceScopedRepository } from 'src/engine/twenty-orm/workspace-scoped-repository/inject-workspace-scoped-repository.decorator';
import { WorkspaceScopedRepository } from 'src/engine/twenty-orm/workspace-scoped-repository/workspace-scoped-repository';

@Injectable()
export class AppConnectionAccessService {
  constructor(
    private readonly permissionsService: PermissionsService,
    @InjectWorkspaceScopedRepository(ConnectionProviderEntity)
    private readonly connectionProviderRepository: WorkspaceScopedRepository<ConnectionProviderEntity>,
    @InjectRepository(ConnectedAccountEntity)
    private readonly connectedAccountRepository: Repository<ConnectedAccountEntity>,
  ) {}

  async validateConnectionAccessOrThrow({
    provider,
    workspaceId,
    userId,
    userWorkspaceId,
    visibility: requestedVisibility,
    reconnectingConnectedAccountId,
    entityManager = this.connectedAccountRepository.manager,
  }: {
    provider: Pick<ConnectionProviderEntity, 'id' | 'applicationId'>;
    workspaceId: string;
    userId: string;
    userWorkspaceId: string;
    visibility?: ConnectedAccountVisibility;
    reconnectingConnectedAccountId: string | null;
    entityManager?: EntityManager;
  }): Promise<{
    reconnectTarget: ConnectedAccountEntity | null;
    visibility: ConnectedAccountVisibility;
  }> {
    const isTransactionActive = entityManager.queryRunner?.isTransactionActive;
    // The provider lock also serializes callbacks when no account exists yet.
    const currentProvider = await this.connectionProviderRepository
      .withManager(entityManager)
      .findOne(workspaceId, {
        where: {
          id: provider.id,
          applicationId: provider.applicationId,
        },
        lock: isTransactionActive ? { mode: 'pessimistic_write' } : undefined,
      });

    if (!isDefined(currentProvider)) {
      throw new ConnectionProviderException(
        'The connection provider changed during authorization. Start again.',
        ConnectionProviderExceptionCode.INVALID_STATE,
      );
    }

    const member = await entityManager.findOne(UserWorkspaceEntity, {
      where: { id: userWorkspaceId, userId, workspaceId },
      lock: isTransactionActive ? { mode: 'pessimistic_read' } : undefined,
    });

    if (!isDefined(member)) {
      throw new ConnectionProviderException(
        'The member no longer belongs to this workspace.',
        ConnectionProviderExceptionCode.FORBIDDEN,
      );
    }

    const reconnectTarget = isDefined(reconnectingConnectedAccountId)
      ? await entityManager.findOne(ConnectedAccountEntity, {
          where: buildConnectedAccountUsableByCallerWhere({
            baseWhere: {
              id: reconnectingConnectedAccountId,
              workspaceId,
              connectionProviderId: provider.id,
              applicationId: provider.applicationId,
              provider: ConnectedAccountProvider.APP,
            },
            userWorkspaceId,
          }),
          lock: isTransactionActive ? { mode: 'pessimistic_write' } : undefined,
        })
      : null;

    if (
      isDefined(reconnectingConnectedAccountId) &&
      !isDefined(reconnectTarget)
    ) {
      throw new ConnectionProviderException(
        'The connection can no longer be reconnected by this member.',
        ConnectionProviderExceptionCode.FORBIDDEN,
      );
    }

    const visibility =
      requestedVisibility ?? reconnectTarget?.visibility ?? 'user';

    await this.validateCallerCanManageConnection({
      isWorkspaceShared:
        visibility === 'workspace' ||
        reconnectTarget?.visibility === 'workspace',
      workspaceId,
      userWorkspaceId,
    });

    if (reconnectTarget?.visibility === 'workspace' && visibility === 'user') {
      throw new ConnectionProviderException(
        'Reconnect cannot make a shared connection personal.',
        ConnectionProviderExceptionCode.INVALID_REQUEST,
      );
    }

    return { reconnectTarget, visibility };
  }

  async validateCallerCanManageConnection({
    isWorkspaceShared,
    workspaceId,
    userWorkspaceId,
    apiKeyId,
    applicationId,
  }: {
    isWorkspaceShared: boolean;
    workspaceId: string;
    userWorkspaceId?: string;
    apiKeyId?: string;
    applicationId?: string;
  }): Promise<void> {
    if (!isWorkspaceShared) {
      return;
    }

    const hasPermission =
      await this.permissionsService.userHasWorkspaceSettingPermission({
        userWorkspaceId,
        workspaceId,
        setting: getConnectedAccountAdministrationPermissionFlag(
          ConnectedAccountProvider.APP,
        ),
        apiKeyId,
        applicationId,
      });

    if (!hasPermission) {
      throw new PermissionsException(
        PermissionsExceptionMessage.PERMISSION_DENIED,
        PermissionsExceptionCode.PERMISSION_DENIED,
        {
          userFriendlyMessage: msg`You do not have permission to manage connections shared with the workspace. Please contact your workspace administrator for access.`,
        },
      );
    }
  }
}
