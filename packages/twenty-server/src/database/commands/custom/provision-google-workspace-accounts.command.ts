import { Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { Command } from 'nest-commander';
import {
  ConnectedAccountProvider,
  FieldMetadataType,
} from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';
import { Repository } from 'typeorm';
import { v4 } from 'uuid';

import { ActiveOrSuspendedWorkspacesMigrationCommandRunner } from 'src/database/commands/command-runners/active-or-suspended-workspaces-migration.command-runner';
import { type RunOnWorkspaceArgs } from 'src/database/commands/command-runners/workspaces-migration.command-runner';
import { getGoogleApisOauthScopes } from 'src/engine/core-modules/auth/utils/get-google-apis-oauth-scopes';
import { TwentyConfigService } from 'src/engine/core-modules/twenty-config/twenty-config.service';
import { WorkspaceEntity } from 'src/engine/core-modules/workspace/workspace.entity';
import { DataSourceService } from 'src/engine/metadata-modules/data-source/data-source.service';
import { FieldMetadataEntity } from 'src/engine/metadata-modules/field-metadata/field-metadata.entity';
import { ObjectMetadataEntity } from 'src/engine/metadata-modules/object-metadata/object-metadata.entity';
import { GlobalWorkspaceOrmManager } from 'src/engine/twenty-orm/global-workspace-datasource/global-workspace-orm.manager';
import { type ConnectedAccountWorkspaceEntity } from 'src/modules/connected-account/standard-objects/connected-account.workspace-entity';
import {
  MessageChannelPendingGroupEmailsAction,
  MessageChannelSyncStage,
  MessageChannelSyncStatus,
  MessageChannelType,
  MessageChannelVisibility,
  type MessageChannelWorkspaceEntity,
} from 'src/modules/messaging/common/standard-objects/message-channel.workspace-entity';
import { type WorkspaceMemberWorkspaceEntity } from 'src/modules/workspace-member/standard-objects/workspace-member.workspace-entity';

@Command({
  name: 'workspace:provision-google-workspace-accounts',
  description:
    'Provision Google Workspace connected accounts for agents using domain-wide delegation service account.',
})
export class ProvisionGoogleWorkspaceAccountsCommand extends ActiveOrSuspendedWorkspacesMigrationCommandRunner {
  protected override readonly logger = new Logger(
    ProvisionGoogleWorkspaceAccountsCommand.name,
  );

  constructor(
    @InjectRepository(WorkspaceEntity)
    protected readonly workspaceRepository: Repository<WorkspaceEntity>,
    protected readonly globalWorkspaceOrmManager: GlobalWorkspaceOrmManager,
    protected readonly dataSourceService: DataSourceService,
    @InjectRepository(ObjectMetadataEntity)
    private readonly objectMetadataRepository: Repository<ObjectMetadataEntity>,
    @InjectRepository(FieldMetadataEntity)
    private readonly fieldMetadataRepository: Repository<FieldMetadataEntity>,
    private readonly twentyConfigService: TwentyConfigService,
  ) {
    super(workspaceRepository, globalWorkspaceOrmManager, dataSourceService);
  }

  override async runOnWorkspace({
    workspaceId,
    options,
  }: RunOnWorkspaceArgs): Promise<void> {
    if (
      !isDefined(
        this.twentyConfigService.get('GOOGLE_SERVICE_ACCOUNT_KEY_JSON'),
      )
    ) {
      this.logger.error(
        'GOOGLE_SERVICE_ACCOUNT_KEY_JSON is not configured. Aborting.',
      );

      return;
    }

    // Find Agent object metadata
    let agentObjectMetadata = await this.objectMetadataRepository.findOne({
      where: { nameSingular: 'agent', workspaceId, isActive: true },
    });

    if (!agentObjectMetadata) {
      agentObjectMetadata = await this.objectMetadataRepository.findOne({
        where: { nameSingular: 'agentProfile', workspaceId, isActive: true },
      });
    }

    if (!agentObjectMetadata) {
      this.logger.log(
        `No active Agent object found in workspace ${workspaceId}, skipping`,
      );

      return;
    }

    // Find WorkspaceMember relation on Agent (to match agents to workspace members)
    const workspaceMemberObjectMetadata =
      await this.objectMetadataRepository.findOne({
        where: {
          nameSingular: 'workspaceMember',
          workspaceId,
          isActive: true,
        },
      });

    if (!workspaceMemberObjectMetadata) return;

    const workspaceMemberRelationField =
      await this.fieldMetadataRepository.findOne({
        where: {
          objectMetadataId: agentObjectMetadata.id,
          type: FieldMetadataType.RELATION,
          relationTargetObjectMetadataId: workspaceMemberObjectMetadata.id,
          workspaceId,
          isActive: true,
        },
      });

    if (!workspaceMemberRelationField) {
      this.logger.log(
        `No WorkspaceMember relation field found on Agent in workspace ${workspaceId}, skipping`,
      );

      return;
    }

    const foreignKeyColumn = `${workspaceMemberRelationField.name}Id`;

    // Load agents with their emails
    const agentRepository = await this.globalWorkspaceOrmManager.getRepository(
      workspaceId,
      agentObjectMetadata.nameSingular,
      { shouldBypassPermissionChecks: true },
    );

    const agents = await agentRepository
      .createQueryBuilder('agent')
      .where('agent."deletedAt" IS NULL')
      .getMany();

    if (agents.length === 0) {
      this.logger.log(`No agents found in workspace ${workspaceId}`);

      return;
    }

    // Load workspace members
    const workspaceMemberRepository =
      await this.globalWorkspaceOrmManager.getRepository<WorkspaceMemberWorkspaceEntity>(
        workspaceId,
        'workspaceMember',
        { shouldBypassPermissionChecks: true },
      );

    const workspaceMembers = await workspaceMemberRepository.find();

    const workspaceMemberById = new Map<
      string,
      WorkspaceMemberWorkspaceEntity
    >();

    for (const member of workspaceMembers) {
      workspaceMemberById.set(member.id, member);
    }

    // Load existing connected accounts
    const connectedAccountRepository =
      await this.globalWorkspaceOrmManager.getRepository<ConnectedAccountWorkspaceEntity>(
        workspaceId,
        'connectedAccount',
        { shouldBypassPermissionChecks: true },
      );

    const existingConnectedAccounts = await connectedAccountRepository.find();

    const existingHandles = new Set(
      existingConnectedAccounts.map((account) => account.handle?.toLowerCase()),
    );

    // Load existing message channels
    const messageChannelRepository =
      await this.globalWorkspaceOrmManager.getRepository<MessageChannelWorkspaceEntity>(
        workspaceId,
        'messageChannel',
        { shouldBypassPermissionChecks: true },
      );

    const existingMessageChannels = await messageChannelRepository.find();

    const connectedAccountIdsWithMessageChannels = new Set(
      existingMessageChannels.map((channel) => channel.connectedAccountId),
    );

    const scopes = getGoogleApisOauthScopes();
    let provisionedCount = 0;
    let skippedCount = 0;

    for (const agent of agents) {
      const agentRecord = agent as Record<string, unknown>;
      const emails = agentRecord.emails as
        | { primaryEmail?: string }
        | undefined;
      const primaryEmail = emails?.primaryEmail;

      if (!primaryEmail) {
        this.logger.log(
          `Agent "${agentRecord.name ?? agentRecord.id}" has no primary email, skipping`,
        );
        continue;
      }

      // Find workspace member for this agent
      const workspaceMemberId = agentRecord[foreignKeyColumn] as
        | string
        | undefined;

      if (!workspaceMemberId) {
        this.logger.log(
          `Agent "${agentRecord.name ?? agentRecord.id}" (${primaryEmail}) has no linked workspace member, skipping`,
        );
        continue;
      }

      const workspaceMember = workspaceMemberById.get(workspaceMemberId);

      if (!workspaceMember) {
        this.logger.log(
          `Workspace member ${workspaceMemberId} not found for agent "${agentRecord.name ?? agentRecord.id}", skipping`,
        );
        continue;
      }

      // Check if connected account already exists for this handle
      if (existingHandles.has(primaryEmail.toLowerCase())) {
        this.logger.log(
          `Connected account already exists for ${primaryEmail}, skipping`,
        );
        skippedCount++;
        continue;
      }

      if (options.dryRun) {
        this.logger.log(
          `[DRY RUN] Would provision connected account for ${primaryEmail} (agent: ${agentRecord.name ?? agentRecord.id}, workspace member: ${workspaceMember.userEmail})`,
        );
        provisionedCount++;
        continue;
      }

      // Create connected account
      const connectedAccountId = v4();

      await connectedAccountRepository.save({
        id: connectedAccountId,
        handle: primaryEmail,
        provider: ConnectedAccountProvider.GOOGLE,
        accessToken: '',
        refreshToken: 'SERVICE_ACCOUNT',
        accountOwnerId: workspaceMemberId,
        scopes,
      });

      this.logger.log(
        `Created connected account ${connectedAccountId} for ${primaryEmail}`,
      );

      // Create message channel if not already exists
      if (!connectedAccountIdsWithMessageChannels.has(connectedAccountId)) {
        const messageChannelId = v4();

        await messageChannelRepository.insert({
          id: messageChannelId,
          connectedAccountId,
          type: MessageChannelType.EMAIL,
          handle: primaryEmail,
          visibility: MessageChannelVisibility.SHARE_EVERYTHING,
          syncStatus: MessageChannelSyncStatus.ONGOING,
          syncStage: MessageChannelSyncStage.MESSAGE_LIST_FETCH_PENDING,
          pendingGroupEmailsAction: MessageChannelPendingGroupEmailsAction.NONE,
        });

        this.logger.log(
          `Created message channel ${messageChannelId} for ${primaryEmail}`,
        );
      }

      existingHandles.add(primaryEmail.toLowerCase());
      provisionedCount++;
    }

    this.logger.log(
      `${options.dryRun ? '[DRY RUN] ' : ''}Provisioned ${provisionedCount} accounts, skipped ${skippedCount} existing in workspace ${workspaceId}`,
    );
  }
}
