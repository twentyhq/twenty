import { InjectRepository } from '@nestjs/typeorm';

import { isNonEmptyString } from '@sniptt/guards';
import { Command } from 'nest-commander';
import { FeatureFlagKey } from 'twenty-shared/types';
import { Repository } from 'typeorm';

import { ActiveOrSuspendedWorkspaceCommandRunner } from 'src/database/commands/command-runners/active-or-suspended-workspace.command-runner';
import { type RunOnWorkspaceArgs } from 'src/database/commands/command-runners/workspace.command-runner';
import { WorkspaceIteratorService } from 'src/database/commands/command-runners/workspace-iterator.service';
import { RegisteredWorkspaceCommand } from 'src/engine/core-modules/upgrade/decorators/registered-workspace-command.decorator';
import { FeatureFlagService } from 'src/engine/core-modules/feature-flag/services/feature-flag.service';
import { UserWorkspaceEntity } from 'src/engine/core-modules/user-workspace/user-workspace.entity';
import { CalendarChannelEntity } from 'src/engine/metadata-modules/calendar-channel/entities/calendar-channel.entity';
import { ConnectedAccountEntity } from 'src/engine/metadata-modules/connected-account/entities/connected-account.entity';
import { MessageChannelEntity } from 'src/engine/metadata-modules/message-channel/entities/message-channel.entity';
import { MessageFolderEntity } from 'src/engine/metadata-modules/message-folder/entities/message-folder.entity';
import { GlobalWorkspaceOrmManager } from 'src/engine/twenty-orm/global-workspace-datasource/global-workspace-orm.manager';
import { type ConnectedAccountWorkspaceEntity } from 'src/modules/connected-account/standard-objects/connected-account.workspace-entity';
import { type MessageFolderWorkspaceEntity } from 'src/modules/messaging/common/standard-objects/message-folder.workspace-entity';
import { type WorkspaceMemberWorkspaceEntity } from 'src/modules/workspace-member/standard-objects/workspace-member.workspace-entity';

@RegisteredWorkspaceCommand('1.21.0', 1775500012000)
@Command({
  name: 'upgrade:1-21:migrate-messaging-infrastructure-to-metadata',
  description:
    'Backfill connectedAccount, messageChannel, calendarChannel, and messageFolder to core metadata schema',
})
export class MigrateMessagingInfrastructureToMetadataCommand extends ActiveOrSuspendedWorkspaceCommandRunner {
  constructor(
    private readonly twentyORMGlobalManager: GlobalWorkspaceOrmManager,
    @InjectRepository(ConnectedAccountEntity)
    private readonly connectedAccountRepository: Repository<ConnectedAccountEntity>,
    @InjectRepository(MessageChannelEntity)
    private readonly messageChannelRepository: Repository<MessageChannelEntity>,
    @InjectRepository(CalendarChannelEntity)
    private readonly calendarChannelRepository: Repository<CalendarChannelEntity>,
    @InjectRepository(MessageFolderEntity)
    private readonly messageFolderRepository: Repository<MessageFolderEntity>,
    @InjectRepository(UserWorkspaceEntity)
    private readonly userWorkspaceRepository: Repository<UserWorkspaceEntity>,
    private readonly featureFlagService: FeatureFlagService,
    protected readonly workspaceIteratorService: WorkspaceIteratorService,
  ) {
    super(workspaceIteratorService);
  }

  override async runOnWorkspace({
    workspaceId,
    options,
  }: RunOnWorkspaceArgs): Promise<void> {
    const isMigrated = await this.featureFlagService.isFeatureEnabled(
      FeatureFlagKey.IS_CONNECTED_ACCOUNT_MIGRATED,
      workspaceId,
    );

    if (isMigrated) {
      this.logger.log(
        `Messaging infrastructure migration already completed for workspace ${workspaceId}. Skipping.`,
      );

      return;
    }

    const isDryRun = options.dryRun ?? false;

    const connectedAccountWorkspaceRepository =
      await this.twentyORMGlobalManager.getRepository<ConnectedAccountWorkspaceEntity>(
        workspaceId,
        'connectedAccount',
      );

    const messageChannelWorkspaceRepository =
      await this.twentyORMGlobalManager.getRepository<MessageChannelEntity>(
        workspaceId,
        'messageChannel',
      );

    const calendarChannelWorkspaceRepository =
      await this.twentyORMGlobalManager.getRepository<CalendarChannelEntity>(
        workspaceId,
        'calendarChannel',
      );

    const messageFolderWorkspaceRepository =
      await this.twentyORMGlobalManager.getRepository<MessageFolderWorkspaceEntity>(
        workspaceId,
        'messageFolder',
      );

    const connectedAccounts = await connectedAccountWorkspaceRepository.find();
    const messageChannels = await messageChannelWorkspaceRepository.find();
    const calendarChannels = await calendarChannelWorkspaceRepository.find();
    const messageFolders = await messageFolderWorkspaceRepository.find();

    const workspaceMemberIdToUserWorkspaceIdMap =
      await this.buildWorkspaceMemberIdToUserWorkspaceIdMap(workspaceId);

    const connectedAccountsWithMissingHandle = connectedAccounts.filter(
      (account) => !account.handle,
    );
    const connectedAccountsWithUnresolvedOwner = connectedAccounts.filter(
      (account) =>
        !workspaceMemberIdToUserWorkspaceIdMap.has(account.accountOwnerId),
    );
    const messageChannelsWithMissingHandle = messageChannels.filter(
      (channel) => !channel.handle,
    );
    const calendarChannelsWithMissingHandle = calendarChannels.filter(
      (channel) => !channel.handle,
    );

    if (isDryRun) {
      this.logger.log(
        `[DRY RUN] Workspace ${workspaceId}: ` +
          `${connectedAccounts.length} connected accounts, ` +
          `${messageChannels.length} message channels, ` +
          `${calendarChannels.length} calendar channels, ` +
          `${messageFolders.length} message folders`,
      );

      if (connectedAccountsWithMissingHandle.length > 0) {
        this.logger.warn(
          `[DRY RUN] ${connectedAccountsWithMissingHandle.length} connected accounts have empty handle`,
        );
      }

      if (connectedAccountsWithUnresolvedOwner.length > 0) {
        this.logger.warn(
          `[DRY RUN] ${connectedAccountsWithUnresolvedOwner.length} connected accounts have unresolvable accountOwnerId (no matching userWorkspace)`,
        );
      }

      if (messageChannelsWithMissingHandle.length > 0) {
        this.logger.warn(
          `[DRY RUN] ${messageChannelsWithMissingHandle.length} message channels have empty handle`,
        );
      }

      if (calendarChannelsWithMissingHandle.length > 0) {
        this.logger.warn(
          `[DRY RUN] ${calendarChannelsWithMissingHandle.length} calendar channels have empty handle`,
        );
      }

      return;
    }

    let migratedConnectedAccountIds = new Set(
      connectedAccounts.map((account) => account.id),
    );
    let migratedMessageChannelIds = new Set(
      messageChannels.map((channel) => channel.id),
    );

    if (connectedAccounts.length > 0) {
      const coreConnectedAccounts = connectedAccounts
        .filter((workspaceEntity) => {
          const userWorkspaceId = workspaceMemberIdToUserWorkspaceIdMap.get(
            workspaceEntity.accountOwnerId,
          );

          if (!userWorkspaceId) {
            this.logger.warn(
              `Skipping connected account ${workspaceEntity.id}: no userWorkspace found for workspaceMember ${workspaceEntity.accountOwnerId}`,
            );

            return false;
          }

          return true;
        })
        .map((workspaceEntity) => {
          const handleAliases = isNonEmptyString(workspaceEntity.handleAliases)
            ? workspaceEntity.handleAliases
                .split(',')
                .map((alias) => alias.trim())
            : null;

          return {
            id: workspaceEntity.id,
            handle: workspaceEntity.handle ?? '',
            provider: workspaceEntity.provider,
            accessToken: workspaceEntity.accessToken,
            refreshToken: workspaceEntity.refreshToken,
            lastCredentialsRefreshedAt:
              workspaceEntity.lastCredentialsRefreshedAt,
            authFailedAt: workspaceEntity.authFailedAt,
            handleAliases,
            scopes: workspaceEntity.scopes,
            connectionParameters:
              workspaceEntity.connectionParameters as Record<
                string,
                unknown
              > | null,
            userWorkspaceId: workspaceMemberIdToUserWorkspaceIdMap.get(
              workspaceEntity.accountOwnerId,
            )!,
            workspaceId,
            createdAt: workspaceEntity.createdAt,
            updatedAt: workspaceEntity.updatedAt,
          };
        });

      if (coreConnectedAccounts.length > 0) {
        await this.connectedAccountRepository.save(coreConnectedAccounts);
        this.logger.log(
          `Migrated ${coreConnectedAccounts.length} connected accounts for workspace ${workspaceId}`,
        );
      }

      migratedConnectedAccountIds = new Set(
        coreConnectedAccounts.map((account) => account.id),
      );
    }

    if (messageChannels.length > 0) {
      const coreMessageChannels = messageChannels
        .filter((workspaceEntity) =>
          migratedConnectedAccountIds.has(workspaceEntity.connectedAccountId),
        )
        .map((workspaceEntity) => ({
          id: workspaceEntity.id,
          visibility: workspaceEntity.visibility,
          handle: workspaceEntity.handle ?? '',
          type: workspaceEntity.type,
          isContactAutoCreationEnabled:
            workspaceEntity.isContactAutoCreationEnabled,
          contactAutoCreationPolicy: workspaceEntity.contactAutoCreationPolicy,
          messageFolderImportPolicy: workspaceEntity.messageFolderImportPolicy,
          excludeNonProfessionalEmails:
            workspaceEntity.excludeNonProfessionalEmails,
          excludeGroupEmails: workspaceEntity.excludeGroupEmails,
          pendingGroupEmailsAction: workspaceEntity.pendingGroupEmailsAction,
          isSyncEnabled: workspaceEntity.isSyncEnabled,
          syncCursor: workspaceEntity.syncCursor,
          syncedAt: workspaceEntity.syncedAt
            ? new Date(workspaceEntity.syncedAt)
            : null,
          syncStatus: workspaceEntity.syncStatus ?? 'NOT_SYNCED',
          syncStage: workspaceEntity.syncStage,
          syncStageStartedAt: workspaceEntity.syncStageStartedAt
            ? new Date(workspaceEntity.syncStageStartedAt)
            : null,
          throttleFailureCount: workspaceEntity.throttleFailureCount,
          throttleRetryAfter: workspaceEntity.throttleRetryAfter
            ? new Date(workspaceEntity.throttleRetryAfter)
            : null,
          connectedAccountId: workspaceEntity.connectedAccountId,
          workspaceId,
          createdAt: workspaceEntity.createdAt,
          updatedAt: workspaceEntity.updatedAt,
        }));

      if (coreMessageChannels.length > 0) {
        await this.messageChannelRepository.save(
          coreMessageChannels as unknown as MessageChannelEntity[],
        );
        this.logger.log(
          `Migrated ${coreMessageChannels.length} message channels for workspace ${workspaceId}`,
        );
      }

      migratedMessageChannelIds = new Set(
        coreMessageChannels.map((channel) => channel.id),
      );
    }

    if (calendarChannels.length > 0) {
      const coreCalendarChannels = calendarChannels
        .filter((workspaceEntity) =>
          migratedConnectedAccountIds.has(workspaceEntity.connectedAccountId),
        )
        .map((workspaceEntity) => ({
          id: workspaceEntity.id,
          handle: workspaceEntity.handle ?? '',
          syncStatus: workspaceEntity.syncStatus ?? 'NOT_SYNCED',
          syncStage: workspaceEntity.syncStage,
          visibility: workspaceEntity.visibility,
          isContactAutoCreationEnabled:
            workspaceEntity.isContactAutoCreationEnabled,
          contactAutoCreationPolicy: workspaceEntity.contactAutoCreationPolicy,
          isSyncEnabled: workspaceEntity.isSyncEnabled,
          syncCursor: workspaceEntity.syncCursor,
          syncedAt: workspaceEntity.syncedAt
            ? new Date(workspaceEntity.syncedAt)
            : null,
          syncStageStartedAt: workspaceEntity.syncStageStartedAt
            ? new Date(workspaceEntity.syncStageStartedAt)
            : null,
          throttleFailureCount: workspaceEntity.throttleFailureCount,
          connectedAccountId: workspaceEntity.connectedAccountId,
          workspaceId,
          createdAt: workspaceEntity.createdAt,
          updatedAt: workspaceEntity.updatedAt,
        }));

      await this.calendarChannelRepository.save(
        coreCalendarChannels as unknown as CalendarChannelEntity[],
      );
      this.logger.log(
        `Migrated ${coreCalendarChannels.length} calendar channels for workspace ${workspaceId}`,
      );
    }

    if (messageFolders.length > 0) {
      const externalIdToFolderIdMap = new Map(
        messageFolders.map((folder) => [folder.externalId, folder.id]),
      );

      const coreMessageFolders = messageFolders
        .filter((workspaceEntity) =>
          migratedMessageChannelIds.has(workspaceEntity.messageChannelId),
        )
        .map((workspaceEntity) => {
          let resolvedParentFolderId: string | null = null;

          if (isNonEmptyString(workspaceEntity.parentFolderId)) {
            resolvedParentFolderId =
              externalIdToFolderIdMap.get(workspaceEntity.parentFolderId) ??
              null;

            if (!resolvedParentFolderId) {
              this.logger.warn(
                `Message folder ${workspaceEntity.id}: could not resolve parentFolderId externalId "${workspaceEntity.parentFolderId}" to a UUID`,
              );
            }
          }

          return {
            id: workspaceEntity.id,
            name: workspaceEntity.name,
            syncCursor: workspaceEntity.syncCursor,
            isSentFolder: workspaceEntity.isSentFolder,
            isSynced: workspaceEntity.isSynced,
            parentFolderId: resolvedParentFolderId,
            externalId: workspaceEntity.externalId,
            pendingSyncAction: workspaceEntity.pendingSyncAction,
            messageChannelId: workspaceEntity.messageChannelId,
            workspaceId,
            createdAt: workspaceEntity.createdAt,
            updatedAt: workspaceEntity.updatedAt,
          };
        });

      await this.messageFolderRepository.save(
        coreMessageFolders as unknown as MessageFolderEntity[],
      );
      this.logger.log(
        `Migrated ${coreMessageFolders.length} message folders for workspace ${workspaceId}`,
      );
    }
  }

  private async buildWorkspaceMemberIdToUserWorkspaceIdMap(
    workspaceId: string,
  ): Promise<Map<string, string>> {
    const workspaceMemberRepository =
      await this.twentyORMGlobalManager.getRepository<WorkspaceMemberWorkspaceEntity>(
        workspaceId,
        'workspaceMember',
      );

    const workspaceMembers = await workspaceMemberRepository.find();
    const userWorkspaces = await this.userWorkspaceRepository.find({
      where: { workspaceId },
      select: ['id', 'userId'],
    });

    const userWorkspaceIdByUserId = new Map(
      userWorkspaces.map((userWorkspace) => [
        userWorkspace.userId,
        userWorkspace.id,
      ]),
    );

    return new Map(
      workspaceMembers
        .filter((member) => userWorkspaceIdByUserId.has(member.userId))
        .map((member) => [
          member.id,
          userWorkspaceIdByUserId.get(member.userId)!,
        ]),
    );
  }
}
