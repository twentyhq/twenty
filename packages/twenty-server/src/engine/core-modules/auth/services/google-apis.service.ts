import { Injectable, Inject } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { Repository, EntityManager } from 'typeorm';
import { v4 } from 'uuid';

import { TypeORMService } from 'src/database/typeorm/typeorm.service';
import { FeatureFlagEntity } from 'src/engine/core-modules/feature-flag/feature-flag.entity';
import { EnvironmentService } from 'src/engine/integrations/environment/environment.service';
import { MessageQueue } from 'src/engine/integrations/message-queue/message-queue.constants';
import { MessageQueueService } from 'src/engine/integrations/message-queue/services/message-queue.service';
import { DataSourceService } from 'src/engine/metadata-modules/data-source/data-source.service';
import { InjectObjectMetadataRepository } from 'src/engine/object-metadata-repository/object-metadata-repository.decorator';
import {
  GoogleCalendarSyncJobData,
  GoogleCalendarSyncJob,
} from 'src/modules/calendar/jobs/google-calendar-sync.job';
import { CalendarChannelRepository } from 'src/modules/calendar/repositories/calendar-channel.repository';
import {
  CalendarChannelObjectMetadata,
  CalendarChannelVisibility,
} from 'src/modules/calendar/standard-objects/calendar-channel.object-metadata';
import { ConnectedAccountRepository } from 'src/modules/connected-account/repositories/connected-account.repository';
import {
  ConnectedAccountObjectMetadata,
  ConnectedAccountProvider,
} from 'src/modules/connected-account/standard-objects/connected-account.object-metadata';
import { MessageChannelRepository } from 'src/modules/messaging/repositories/message-channel.repository';
import {
  MessageChannelObjectMetadata,
  MessageChannelType,
  MessageChannelVisibility,
} from 'src/modules/messaging/standard-objects/message-channel.object-metadata';
import {
  GmailFullSyncJobData,
  GmailFullSyncJob,
} from 'src/modules/messaging/jobs/gmail-full-sync.job';

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
    @InjectObjectMetadataRepository(ConnectedAccountObjectMetadata)
    private readonly connectedAccountRepository: ConnectedAccountRepository,
    @InjectObjectMetadataRepository(MessageChannelObjectMetadata)
    private readonly messageChannelRepository: MessageChannelRepository,
    @InjectObjectMetadataRepository(CalendarChannelObjectMetadata)
    private readonly calendarChannelRepository: CalendarChannelRepository,
  ) {}

  async refreshGoogleRefreshToken(input: {
    handle: string;
    workspaceMemberId: string;
    workspaceId: string;
    accessToken: string;
    refreshToken: string;
  }) {
    const { handle, workspaceId, workspaceMemberId } = input;

    const dataSourceMetadata =
      await this.dataSourceService.getLastDataSourceMetadataFromWorkspaceIdOrFail(
        workspaceId,
      );

    const workspaceDataSource =
      await this.typeORMService.connectToDataSource(dataSourceMetadata);

    const isCalendarEnabled = this.environmentService.get(
      'CALENDAR_PROVIDER_GOOGLE_ENABLED',
    );

    const connectedAccounts =
      await this.connectedAccountRepository.getAllByHandleAndWorkspaceMemberId(
        handle,
        workspaceMemberId,
        workspaceId,
      );

    const existingAccountId = connectedAccounts?.[0]?.id;
    const newOrExistingConnectedAccountId = existingAccountId ?? v4();

    await workspaceDataSource?.transaction(async (manager: EntityManager) => {
      if (!existingAccountId) {
        await this.connectedAccountRepository.create(
          {
            id: newOrExistingConnectedAccountId,
            handle,
            provider: ConnectedAccountProvider.GOOGLE,
            accessToken: input.accessToken,
            refreshToken: input.refreshToken,
            accountOwnerId: workspaceMemberId,
          },
          workspaceId,
          manager,
        );

        await this.messageChannelRepository.create(
          {
            id: v4(),
            connectedAccountId: newOrExistingConnectedAccountId,
            type: MessageChannelType.EMAIL,
            handle,
            visibility: MessageChannelVisibility.SHARE_EVERYTHING,
          },
          workspaceId,
          manager,
        );

        if (isCalendarEnabled) {
          await this.calendarChannelRepository.create(
            {
              id: v4(),
              connectedAccountId: newOrExistingConnectedAccountId,
              handle,
              visibility: CalendarChannelVisibility.SHARE_EVERYTHING,
            },
            workspaceId,
            manager,
          );
        }
      } else {
        await this.connectedAccountRepository.updateAccessTokenAndRefreshToken(
          input.accessToken,
          input.refreshToken,
          newOrExistingConnectedAccountId,
          workspaceId,
          manager,
        );

        await this.messageChannelRepository.resetSync(
          newOrExistingConnectedAccountId,
          workspaceId,
          manager,
        );
      }
    });

    await this.enqueueSyncJobs(
      newOrExistingConnectedAccountId,
      workspaceId,
      isCalendarEnabled,
    );
  }

  private async enqueueSyncJobs(
    connectedAccountId: string,
    workspaceId: string,
    isCalendarEnabled: boolean,
  ) {
    if (this.environmentService.get('MESSAGING_PROVIDER_GMAIL_ENABLED')) {
      await this.messageQueueService.add<GmailFullSyncJobData>(
        GmailFullSyncJob.name,
        {
          workspaceId,
          connectedAccountId,
        },
      );
    }

    if (
      this.environmentService.get('CALENDAR_PROVIDER_GOOGLE_ENABLED') &&
      isCalendarEnabled
    ) {
      await this.calendarQueueService.add<GoogleCalendarSyncJobData>(
        GoogleCalendarSyncJob.name,
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
}
