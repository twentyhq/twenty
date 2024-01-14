import { Inject, Injectable } from '@nestjs/common';

import { v4 } from 'uuid';

import { DataSourceService } from 'src/metadata/data-source/data-source.service';
import { TypeORMService } from 'src/database/typeorm/typeorm.service';
import { SaveConnectedAccountInput } from 'src/core/auth/dto/save-connected-account';
import { MessageQueue } from 'src/integrations/message-queue/message-queue.constants';
import { MessageQueueService } from 'src/integrations/message-queue/services/message-queue.service';
import {
  GmailFullSyncJob,
  GmailFullSyncJobData,
} from 'src/workspace/messaging/jobs/gmail-full-sync.job';

@Injectable()
export class GoogleGmailService {
  constructor(
    private readonly dataSourceService: DataSourceService,
    private readonly typeORMService: TypeORMService,
    @Inject(MessageQueue.messagingQueue)
    private readonly messageQueueService: MessageQueueService,
  ) {}

  async saveConnectedAccount(
    saveConnectedAccountInput: SaveConnectedAccountInput,
  ) {
    const {
      handle,
      workspaceId,
      provider,
      accessToken,
      refreshToken,
      workspaceMemberId,
    } = saveConnectedAccountInput;

    const dataSourceMetadata =
      await this.dataSourceService.getLastDataSourceMetadataFromWorkspaceIdOrFail(
        workspaceId,
      );

    const workspaceDataSource =
      await this.typeORMService.connectToDataSource(dataSourceMetadata);

    const connectedAccount = await workspaceDataSource?.query(
      `SELECT * FROM ${dataSourceMetadata.schema}."connectedAccount" WHERE "handle" = $1 AND "provider" = $2 AND "accountOwnerId" = $3`,
      [handle, provider, workspaceMemberId],
    );

    if (connectedAccount.length > 0) {
      console.log('This account is already connected to your workspace.');

      return;
    }

    const connectedAccountId = v4();

    await workspaceDataSource?.transaction(async (manager) => {
      await manager.query(
        `INSERT INTO ${dataSourceMetadata.schema}."connectedAccount" ("id", "handle", "provider", "accessToken", "refreshToken", "accountOwnerId") VALUES ($1, $2, $3, $4, $5, $6)`,
        [
          connectedAccountId,
          handle,
          provider,
          accessToken,
          refreshToken,
          workspaceMemberId,
        ],
      );

      await manager.query(
        `INSERT INTO ${dataSourceMetadata.schema}."messageChannel" ("visibility", "handle", "connectedAccountId", "type") VALUES ($1, $2, $3, $4)`,
        ['share_everything', handle, connectedAccountId, 'gmail'],
      );
    });

    await this.messageQueueService.add<GmailFullSyncJobData>(
      GmailFullSyncJob.name,
      {
        workspaceId,
        connectedAccountId,
      },
      {
        id: connectedAccountId,
        retryLimit: 2,
      },
    );

    return;
  }
}
