import { ConflictException, Inject, Injectable } from '@nestjs/common';

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
import {
  GoogleCalendarFullSyncJob,
  GoogleCalendarFullSyncJobData,
} from 'src/workspace/calendar/jobs/google-calendar-full-sync.job';
import { EnvironmentService } from 'src/integrations/environment/environment.service';

@Injectable()
export class GoogleAPIsService {
  constructor(
    private readonly dataSourceService: DataSourceService,
    private readonly typeORMService: TypeORMService,
    @Inject(MessageQueue.messagingQueue)
    private readonly messageQueueService: MessageQueueService,
    private readonly environmentService: EnvironmentService,
  ) {}

  providerName = 'google';

  async saveConnectedAccount(
    saveConnectedAccountInput: SaveConnectedAccountInput,
  ) {
    const {
      handle,
      workspaceId,
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
      [handle, this.providerName, workspaceMemberId],
    );

    if (connectedAccount.length > 0) {
      throw new ConflictException('Connected account already exists');
    }

    const connectedAccountId = v4();

    await workspaceDataSource?.transaction(async (manager) => {
      await manager.query(
        `INSERT INTO ${dataSourceMetadata.schema}."connectedAccount" ("id", "handle", "provider", "accessToken", "refreshToken", "accountOwnerId") VALUES ($1, $2, $3, $4, $5, $6)`,
        [
          connectedAccountId,
          handle,
          this.providerName,
          accessToken,
          refreshToken,
          workspaceMemberId,
        ],
      );

      if (this.environmentService.isMessagingProviderGmailEnabled()) {
        await manager.query(
          `INSERT INTO ${dataSourceMetadata.schema}."messageChannel" ("visibility", "handle", "connectedAccountId", "type") VALUES ($1, $2, $3, $4)`,
          ['share_everything', handle, connectedAccountId, 'email'],
        );
      }

      if (this.environmentService.isCalendarProviderGoogleEnabled()) {
        await manager.query(
          `INSERT INTO ${dataSourceMetadata.schema}."calendarChannel" ("visibility", "handle", "connectedAccountId") VALUES ($1, $2, $3)`,
          ['SHARE_EVERYTHING', handle, connectedAccountId],
        );
      }
    });

    if (this.environmentService.isMessagingProviderGmailEnabled()) {
      await this.messageQueueService.add<GmailFullSyncJobData>(
        GmailFullSyncJob.name,
        {
          workspaceId,
          connectedAccountId,
        },
        {
          retryLimit: 2,
        },
      );
    }

    if (this.environmentService.isCalendarProviderGoogleEnabled()) {
      await this.messageQueueService.add<GoogleCalendarFullSyncJobData>(
        GoogleCalendarFullSyncJob.name,
        {
          workspaceId,
          connectedAccountId,
        },
        {
          retryLimit: 2,
        },
      );
    }

    return;
  }
}
