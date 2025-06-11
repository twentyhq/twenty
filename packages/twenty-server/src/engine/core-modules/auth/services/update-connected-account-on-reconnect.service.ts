import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { Repository } from 'typeorm';

import { DatabaseEventAction } from 'src/engine/api/graphql/graphql-query-runner/enums/database-event-action';
import { ObjectMetadataEntity } from 'src/engine/metadata-modules/object-metadata/object-metadata.entity';
import { WorkspaceEntityManager } from 'src/engine/twenty-orm/entity-manager/workspace-entity-manager';
import { TwentyORMGlobalManager } from 'src/engine/twenty-orm/twenty-orm-global.manager';
import { WorkspaceEventEmitter } from 'src/engine/workspace-event-emitter/workspace-event-emitter';
import { ConnectedAccountWorkspaceEntity } from 'src/modules/connected-account/standard-objects/connected-account.workspace-entity';

export type UpdateConnectedAccountOnReconnectInput = {
  workspaceId: string;
  connectedAccountId: string;
  accessToken: string;
  refreshToken: string;
  scopes: string[];
  connectedAccount: ConnectedAccountWorkspaceEntity;
  manager: WorkspaceEntityManager;
};

@Injectable()
export class UpdateConnectedAccountOnReconnectService {
  constructor(
    private readonly twentyORMGlobalManager: TwentyORMGlobalManager,
    private readonly workspaceEventEmitter: WorkspaceEventEmitter,
    @InjectRepository(ObjectMetadataEntity, 'core')
    private readonly objectMetadataRepository: Repository<ObjectMetadataEntity>,
  ) {}

  async updateConnectedAccountOnReconnect(
    input: UpdateConnectedAccountOnReconnectInput,
  ): Promise<void> {
    const {
      workspaceId,
      connectedAccountId,
      accessToken,
      refreshToken,
      scopes,
      connectedAccount,
      manager,
    } = input;

    const connectedAccountRepository =
      await this.twentyORMGlobalManager.getRepositoryForWorkspace<ConnectedAccountWorkspaceEntity>(
        workspaceId,
        'connectedAccount',
      );

    const updatedConnectedAccount = await connectedAccountRepository.update(
      {
        id: connectedAccountId,
      },
      {
        accessToken,
        refreshToken,
        scopes,
        authFailedAt: null,
      },
      manager,
    );

    const connectedAccountMetadata =
      await this.objectMetadataRepository.findOneOrFail({
        where: { nameSingular: 'connectedAccount', workspaceId },
      });

    this.workspaceEventEmitter.emitDatabaseBatchEvent({
      objectMetadataNameSingular: 'connectedAccount',
      action: DatabaseEventAction.UPDATED,
      events: [
        {
          recordId: connectedAccountId,
          objectMetadata: connectedAccountMetadata,
          properties: {
            before: connectedAccount,
            after: {
              ...connectedAccount,
              ...updatedConnectedAccount.raw[0],
            },
          },
        },
      ],
      workspaceId,
    });
  }
}
