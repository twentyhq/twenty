import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { ConnectedAccountProvider } from 'twenty-shared/types';
import { Repository } from 'typeorm';
import { v4 } from 'uuid';

import { DatabaseEventAction } from 'src/engine/api/graphql/graphql-query-runner/enums/database-event-action';
import { getGoogleApisOauthScopes } from 'src/engine/core-modules/auth/utils/get-google-apis-oauth-scopes';
import { InjectMessageQueue } from 'src/engine/core-modules/message-queue/decorators/message-queue.decorator';
import { MessageQueue } from 'src/engine/core-modules/message-queue/message-queue.constants';
import { MessageQueueService } from 'src/engine/core-modules/message-queue/services/message-queue.service';
import { TwentyConfigService } from 'src/engine/core-modules/twenty-config/twenty-config.service';
import { ObjectMetadataEntity } from 'src/engine/metadata-modules/object-metadata/object-metadata.entity';
import { WorkspaceEntityManager } from 'src/engine/twenty-orm/entity-manager/workspace-entity-manager';
import { TwentyORMGlobalManager } from 'src/engine/twenty-orm/twenty-orm-global.manager';
import { WorkspaceEventEmitter } from 'src/engine/workspace-event-emitter/workspace-event-emitter';
import {
  CalendarEventListFetchJob,
  CalendarEventListFetchJobData,
} from 'src/modules/calendar/calendar-event-import-manager/jobs/calendar-event-list-fetch.job';
import {
  CalendarChannelVisibility,
  CalendarChannelWorkspaceEntity,
} from 'src/modules/calendar/common/standard-objects/calendar-channel.workspace-entity';
import { AccountsToReconnectService } from 'src/modules/connected-account/services/accounts-to-reconnect.service';
import { ConnectedAccountWorkspaceEntity } from 'src/modules/connected-account/standard-objects/connected-account.workspace-entity';
import {
  MessageChannelSyncStage,
  MessageChannelSyncStatus,
  MessageChannelType,
  MessageChannelVisibility,
  MessageChannelWorkspaceEntity,
} from 'src/modules/messaging/common/standard-objects/message-channel.workspace-entity';
import {
  MessagingMessageListFetchJob,
  MessagingMessageListFetchJobData,
} from 'src/modules/messaging/message-import-manager/jobs/messaging-message-list-fetch.job';
import { WorkspaceMemberWorkspaceEntity } from 'src/modules/workspace-member/standard-objects/workspace-member.workspace-entity';

@Injectable()
export class GoogleAPIsService {
  constructor(
    private readonly twentyORMGlobalManager: TwentyORMGlobalManager,
    @InjectMessageQueue(MessageQueue.messagingQueue)
    private readonly messageQueueService: MessageQueueService,
    @InjectMessageQueue(MessageQueue.calendarQueue)
    private readonly calendarQueueService: MessageQueueService,
    private readonly twentyConfigService: TwentyConfigService,
    private readonly accountsToReconnectService: AccountsToReconnectService,
    private readonly workspaceEventEmitter: WorkspaceEventEmitter,
    @InjectRepository(ObjectMetadataEntity, 'metadata')
    private readonly objectMetadataRepository: Repository<ObjectMetadataEntity>,
  ) {}

  async refreshGoogleRefreshToken(input: {
    handle: string;
    workspaceMemberId: string;
    workspaceId: string;
    accessToken: string;
    refreshToken: string;
    calendarVisibility: CalendarChannelVisibility | undefined;
    messageVisibility: MessageChannelVisibility | undefined;
  }) {
    const {
      handle,
      workspaceId,
      workspaceMemberId,
      calendarVisibility,
      messageVisibility,
    } = input;

    const isCalendarEnabled = this.twentyConfigService.get(
      'CALENDAR_PROVIDER_GOOGLE_ENABLED',
    );

    const connectedAccountRepository =
      await this.twentyORMGlobalManager.getRepositoryForWorkspace<ConnectedAccountWorkspaceEntity>(
        workspaceId,
        'connectedAccount',
      );

    const connectedAccount = await connectedAccountRepository.findOne({
      where: { handle, accountOwnerId: workspaceMemberId },
    });

    const existingAccountId = connectedAccount?.id;
    const newOrExistingConnectedAccountId = existingAccountId ?? v4();

    const calendarChannelRepository =
      await this.twentyORMGlobalManager.getRepositoryForWorkspace<CalendarChannelWorkspaceEntity>(
        workspaceId,
        'calendarChannel',
      );

    const messageChannelRepository =
      await this.twentyORMGlobalManager.getRepositoryForWorkspace<MessageChannelWorkspaceEntity>(
        workspaceId,
        'messageChannel',
      );

    const workspaceDataSource =
      await this.twentyORMGlobalManager.getDataSourceForWorkspace(workspaceId);

    const scopes = getGoogleApisOauthScopes();

    await workspaceDataSource.transaction(
      async (manager: WorkspaceEntityManager) => {
        if (!existingAccountId) {
          const newConnectedAccount = await connectedAccountRepository.save(
            {
              id: newOrExistingConnectedAccountId,
              handle,
              provider: ConnectedAccountProvider.GOOGLE,
              accessToken: input.accessToken,
              refreshToken: input.refreshToken,
              accountOwnerId: workspaceMemberId,
              scopes,
            },
            {},
            manager,
          );

          const connectedAccountMetadata =
            await this.objectMetadataRepository.findOneOrFail({
              where: { nameSingular: 'connectedAccount', workspaceId },
            });

          this.workspaceEventEmitter.emitDatabaseBatchEvent({
            objectMetadataNameSingular: 'connectedAccount',
            action: DatabaseEventAction.CREATED,
            events: [
              {
                recordId: newConnectedAccount.id,
                objectMetadata: connectedAccountMetadata,
                properties: {
                  after: newConnectedAccount,
                },
              },
            ],
            workspaceId,
          });

          const newMessageChannel = await messageChannelRepository.save(
            {
              id: v4(),
              connectedAccountId: newOrExistingConnectedAccountId,
              type: MessageChannelType.EMAIL,
              handle,
              visibility:
                messageVisibility || MessageChannelVisibility.SHARE_EVERYTHING,
              syncStatus: MessageChannelSyncStatus.ONGOING,
            },
            {},
            manager,
          );

          const messageChannelMetadata =
            await this.objectMetadataRepository.findOneOrFail({
              where: { nameSingular: 'messageChannel', workspaceId },
            });

          this.workspaceEventEmitter.emitDatabaseBatchEvent({
            objectMetadataNameSingular: 'messageChannel',
            action: DatabaseEventAction.CREATED,
            events: [
              {
                recordId: newMessageChannel.id,
                objectMetadata: messageChannelMetadata,
                properties: {
                  after: newMessageChannel,
                },
              },
            ],
            workspaceId,
          });

          if (isCalendarEnabled) {
            const newCalendarChannel = await calendarChannelRepository.save(
              {
                id: v4(),
                connectedAccountId: newOrExistingConnectedAccountId,
                handle,
                visibility:
                  calendarVisibility ||
                  CalendarChannelVisibility.SHARE_EVERYTHING,
              },
              {},
              manager,
            );

            const calendarChannelMetadata =
              await this.objectMetadataRepository.findOneOrFail({
                where: { nameSingular: 'calendarChannel', workspaceId },
              });

            this.workspaceEventEmitter.emitDatabaseBatchEvent({
              objectMetadataNameSingular: 'calendarChannel',
              action: DatabaseEventAction.CREATED,
              events: [
                {
                  recordId: newCalendarChannel.id,
                  objectMetadata: calendarChannelMetadata,
                  properties: {
                    after: newCalendarChannel,
                  },
                },
              ],
              workspaceId,
            });
          }
        } else {
          const updatedConnectedAccount =
            await connectedAccountRepository.update(
              {
                id: newOrExistingConnectedAccountId,
              },
              {
                accessToken: input.accessToken,
                refreshToken: input.refreshToken,
                scopes,
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
                recordId: newOrExistingConnectedAccountId,
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

          const workspaceMemberRepository =
            await this.twentyORMGlobalManager.getRepositoryForWorkspace<WorkspaceMemberWorkspaceEntity>(
              workspaceId,
              'workspaceMember',
            );

          const workspaceMember = await workspaceMemberRepository.findOneOrFail(
            {
              where: { id: workspaceMemberId },
            },
          );

          const userId = workspaceMember.userId;

          await this.accountsToReconnectService.removeAccountToReconnect(
            userId,
            workspaceId,
            newOrExistingConnectedAccountId,
          );

          const messageChannels = await messageChannelRepository.find({
            where: { connectedAccountId: newOrExistingConnectedAccountId },
          });

          const messageChannelUpdates = await messageChannelRepository.update(
            {
              connectedAccountId: newOrExistingConnectedAccountId,
            },
            {
              syncStage:
                MessageChannelSyncStage.FULL_MESSAGE_LIST_FETCH_PENDING,
              syncStatus: null,
              syncCursor: '',
              syncStageStartedAt: null,
            },
            manager,
          );

          const messageChannelMetadata =
            await this.objectMetadataRepository.findOneOrFail({
              where: { nameSingular: 'messageChannel', workspaceId },
            });

          this.workspaceEventEmitter.emitDatabaseBatchEvent({
            objectMetadataNameSingular: 'messageChannel',
            action: DatabaseEventAction.UPDATED,
            events: messageChannels.map((messageChannel) => ({
              recordId: messageChannel.id,
              objectMetadata: messageChannelMetadata,
              properties: {
                before: messageChannel,
                after: { ...messageChannel, ...messageChannelUpdates.raw[0] },
              },
            })),
            workspaceId,
          });
        }
      },
    );

    if (this.twentyConfigService.get('MESSAGING_PROVIDER_GMAIL_ENABLED')) {
      const messageChannels = await messageChannelRepository.find({
        where: {
          connectedAccountId: newOrExistingConnectedAccountId,
        },
      });

      for (const messageChannel of messageChannels) {
        await this.messageQueueService.add<MessagingMessageListFetchJobData>(
          MessagingMessageListFetchJob.name,
          {
            workspaceId,
            messageChannelId: messageChannel.id,
          },
        );
      }
    }

    if (isCalendarEnabled) {
      const calendarChannels = await calendarChannelRepository.find({
        where: {
          connectedAccountId: newOrExistingConnectedAccountId,
        },
      });

      for (const calendarChannel of calendarChannels) {
        await this.calendarQueueService.add<CalendarEventListFetchJobData>(
          CalendarEventListFetchJob.name,
          {
            calendarChannelId: calendarChannel.id,
            workspaceId,
          },
        );
      }
    }
  }
}
