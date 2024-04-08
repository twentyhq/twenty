import { Inject, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { v4 } from 'uuid';
import { Repository } from 'typeorm';

import { DataSourceService } from 'src/engine/metadata-modules/data-source/data-source.service';
import { TypeORMService } from 'src/database/typeorm/typeorm.service';
import { SaveOrUpdateConnectedAccountInput } from 'src/engine/core-modules/auth/dto/save-connected-account';
import { MessageQueue } from 'src/engine/integrations/message-queue/message-queue.constants';
import { MessageQueueService } from 'src/engine/integrations/message-queue/services/message-queue.service';
import {
  GoogleCalendarFullSyncJob,
  GoogleCalendarFullSyncJobData,
} from 'src/modules/calendar/jobs/google-calendar-full-sync.job';
import { EnvironmentService } from 'src/engine/integrations/environment/environment.service';
import {
  FeatureFlagEntity,
  FeatureFlagKeys,
} from 'src/engine/core-modules/feature-flag/feature-flag.entity';
import {
  GmailFullSyncV2Job,
  GmailFullSyncV2JobData,
} from 'src/modules/messaging/jobs/gmail-full-sync-v2.job';
import { UpdateConnectedAccountInput } from 'src/engine/core-modules/auth/dto/update-connected-account';

@Injectable()
export class GoogleAPIsService {
  constructor(
    private readonly dataSourceService: DataSourceService,
    private readonly typeORMService: TypeORMService,
    @Inject(MessageQueue.messagingQueue)
    private readonly messageQueueService: MessageQueueService,
    @Inject(MessageQueue.calendarQueue)
    private readonly calendarQueueService: MessageQueueService,
    private readonly environmentService: EnvironmentService,
    @InjectRepository(FeatureFlagEntity, 'core')
    private readonly featureFlagRepository: Repository<FeatureFlagEntity>,
  ) {}

  providerName = 'google';

  async saveOrUpdateConnectedAccount(
    saveOrUpdateConnectedAccountInput: SaveOrUpdateConnectedAccountInput,
  ) {
    const { handle, workspaceId, workspaceMemberId } =
      saveOrUpdateConnectedAccountInput;

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
      await this.updateConnectedAccount({
        ...saveOrUpdateConnectedAccountInput,
        connectedAccountId: connectedAccount[0].id,
      });
    } else {
      await this.saveConnectedAccount(saveOrUpdateConnectedAccountInput);
    }
  }

  async saveConnectedAccount(
    saveConnectedAccountInput: SaveOrUpdateConnectedAccountInput,
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

    const connectedAccountId = v4();

    const IsCalendarEnabled = await this.featureFlagRepository.findOneBy({
      workspaceId,
      key: FeatureFlagKeys.IsCalendarEnabled,
      value: true,
    });

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

      if (this.environmentService.get('MESSAGING_PROVIDER_GMAIL_ENABLED')) {
        await manager.query(
          `INSERT INTO ${dataSourceMetadata.schema}."messageChannel" ("visibility", "handle", "connectedAccountId", "type") VALUES ($1, $2, $3, $4)`,
          ['share_everything', handle, connectedAccountId, 'email'],
        );
      }

      if (
        this.environmentService.get('CALENDAR_PROVIDER_GOOGLE_ENABLED') &&
        IsCalendarEnabled
      ) {
        await manager.query(
          `INSERT INTO ${dataSourceMetadata.schema}."calendarChannel" ("visibility", "handle", "connectedAccountId") VALUES ($1, $2, $3)`,
          ['SHARE_EVERYTHING', handle, connectedAccountId],
        );
      }
    });

    if (this.environmentService.get('MESSAGING_PROVIDER_GMAIL_ENABLED')) {
      await this.enqueueGmailFullSyncJob(workspaceId, connectedAccountId);
    }

    if (
      this.environmentService.get('CALENDAR_PROVIDER_GOOGLE_ENABLED') &&
      IsCalendarEnabled
    ) {
      await this.enqueueGoogleCalendarFullSyncJob(
        workspaceId,
        connectedAccountId,
      );
    }

    return;
  }

  async updateConnectedAccount(
    updateConnectedAccountInput: UpdateConnectedAccountInput,
  ) {
    const { workspaceId, accessToken, refreshToken, connectedAccountId } =
      updateConnectedAccountInput;

    const dataSourceMetadata =
      await this.dataSourceService.getLastDataSourceMetadataFromWorkspaceIdOrFail(
        workspaceId,
      );

    const workspaceDataSource =
      await this.typeORMService.connectToDataSource(dataSourceMetadata);

    await workspaceDataSource?.transaction(async (manager) => {
      await manager.query(
        `UPDATE ${dataSourceMetadata.schema}."connectedAccount" SET "accessToken" = $1, "refreshToken" = $2, "authFailedAt" = NULL WHERE "id" = $3`,
        [accessToken, refreshToken, connectedAccountId],
      );
    });

    if (this.environmentService.get('MESSAGING_PROVIDER_GMAIL_ENABLED')) {
      await this.enqueueGmailFullSyncJob(workspaceId, connectedAccountId);
    }

    if (this.environmentService.get('CALENDAR_PROVIDER_GOOGLE_ENABLED')) {
      await this.enqueueGoogleCalendarFullSyncJob(
        workspaceId,
        connectedAccountId,
      );
    }

    return;
  }

  async enqueueGmailFullSyncJob(
    workspaceId: string,
    connectedAccountId: string,
  ) {
    await this.messageQueueService.add<GmailFullSyncV2JobData>(
      GmailFullSyncV2Job.name,
      {
        workspaceId,
        connectedAccountId,
      },
    );
  }

  async enqueueGoogleCalendarFullSyncJob(
    workspaceId: string,
    connectedAccountId: string,
  ) {
    await this.calendarQueueService.add<GoogleCalendarFullSyncJobData>(
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
}
