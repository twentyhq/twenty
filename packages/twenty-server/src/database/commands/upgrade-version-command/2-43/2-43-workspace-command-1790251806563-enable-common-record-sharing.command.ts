import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { BillingSubscriptionService } from 'src/engine/core-modules/billing/services/billing-subscription.service';
import { BillingEntitlementKey } from 'src/engine/core-modules/billing/enums/billing-entitlement-key.enum';
import { preserveLegacyRecordAccess } from 'src/database/commands/upgrade-version-command/2-43/utils/preserve-legacy-record-access.util';
import { backfillChatThreadOwnerGrants } from 'src/engine/metadata-modules/ai/ai-chat/utils/backfill-chat-thread-owner-grants.util';
import { Command } from 'nest-commander';
import { MetadataReadability, MetadataWritability } from 'twenty-shared/types';
import { STANDARD_OBJECTS } from 'twenty-shared/metadata';
import { TWENTY_STANDARD_APPLICATION_UNIVERSAL_IDENTIFIER } from 'twenty-shared/application';
import { isDefined } from 'twenty-shared/utils';

import { ProvisionedWorkspaceCommandRunner } from 'src/database/commands/command-runners/provisioned-workspace.command-runner';
import { WorkspaceIteratorService } from 'src/database/commands/command-runners/workspace-iterator.service';
import { type RunOnWorkspaceArgs } from 'src/database/commands/command-runners/workspace.command-runner';
import { RegisteredWorkspaceCommand } from 'src/engine/core-modules/upgrade/decorators/registered-workspace-command.decorator';
import { AgentHistoryStorageService } from 'src/engine/metadata-modules/ai/ai-history/services/agent-history-storage.service';
import { WorkspaceCacheService } from 'src/engine/workspace-cache/services/workspace-cache.service';
import { WorkspaceMigrationValidateBuildAndRunService } from 'src/engine/workspace-manager/workspace-migration/services/workspace-migration-validate-build-and-run-service';

@RegisteredWorkspaceCommand('2.43.0', 1790251806563)
@Command({
  name: 'upgrade:2-43:enable-common-record-sharing',
  description:
    'Backfill conversation ownership before enabling common record permissions',
})
export class EnableCommonRecordSharingCommand extends ProvisionedWorkspaceCommandRunner {
  constructor(
    protected readonly workspaceIteratorService: WorkspaceIteratorService,
    private readonly workspaceCacheService: WorkspaceCacheService,
    private readonly storage: AgentHistoryStorageService,
    private readonly migrations: WorkspaceMigrationValidateBuildAndRunService,
    private readonly billingSubscriptionService: BillingSubscriptionService,
    @InjectDataSource() private readonly dataSource: DataSource,
  ) {
    super(workspaceIteratorService);
  }

  override runOnWorkspace(args: RunOnWorkspaceArgs): Promise<void> {
    return this.up(args);
  }

  async down(_args: RunOnWorkspaceArgs): Promise<void> {
    // Restoring SYSTEM would reactivate legacy open access for private records.
    // Compatible application rollbacks must retain the activated metadata.
  }

  async up({ workspaceId, options }: RunOnWorkspaceArgs): Promise<void> {
    const {
      flatObjectMetadataMaps,
      flatFieldMetadataMaps,
      flatFieldMetadataMapsOrm,
      featureFlagsMap,
    } = await this.workspaceCacheService.getOrRecompute(workspaceId, [
      'flatObjectMetadataMaps',
      'flatFieldMetadataMaps',
      'flatFieldMetadataMapsOrm',
      'featureFlagsMap',
    ]);
    const thread =
      flatObjectMetadataMaps.byUniversalIdentifier[
        STANDARD_OBJECTS.agentChatThread.universalIdentifier
      ];
    const title =
      flatFieldMetadataMaps.byUniversalIdentifier[
        STANDARD_OBJECTS.agentChatThread.fields.title.universalIdentifier
      ];
    if (!isDefined(thread) || !isDefined(title)) {
      if (await this.storage.isEmptyUnprovisionedWorkspace(workspaceId)) {
        this.logger.log(
          `Skipping common sharing upgrade for workspace ${workspaceId}: schema is absent and history is empty`,
        );
        return;
      }
      throw new Error(
        'Conversation metadata must be provisioned before enabling sharing',
      );
    }
    if (options.dryRun) {
      this.logger.log(
        `Would enable common conversation permissions for ${workspaceId}`,
      );
      return;
    }
    // This reads the former entitlement only to preserve historical access;
    // neither the new sharing API nor record authorization depends on it.
    const historicalFlags: Partial<Record<string, boolean>> = featureFlagsMap;
    const wasRecordSharingEnabled =
      historicalFlags['IS_RECORD_SHARING_ENABLED'] === true &&
      (await this.billingSubscriptionService.getWorkspaceEntitlementValue(
        workspaceId,
        BillingEntitlementKey.RECORD_SHARING,
      ));
    await preserveLegacyRecordAccess({
      manager: this.dataSource.manager,
      workspaceId,
      objects: Object.values(
        flatObjectMetadataMaps.byUniversalIdentifier,
      ).filter(isDefined),
      wasRecordSharingEnabled,
      inheritanceMetadata: {
        flatObjectMetadataMaps,
        flatFieldMetadataMaps: flatFieldMetadataMapsOrm,
      },
    });
    // Ownership commits before metadata changes. Retries are idempotent and
    // failure leaves SYSTEM protection intact.
    await this.storage.run(workspaceId, async ({ manager, table, storage }) => {
      if (storage !== 'workspace') {
        throw new Error(
          'Migrate agent history to workspace storage before enabling common record permissions',
        );
      }
      await backfillChatThreadOwnerGrants({
        manager,
        workspaceId,
        threadTableExpression: table('agentChatThread'),
        isCoreStorage: false,
      });
    });
    await this.workspaceCacheService.invalidateAndRecompute(workspaceId, [
      'rolesPermissions',
    ]);
    const result =
      await this.migrations.validateBuildAndRunLegacyWorkspaceMigration({
        workspaceId,
        isSystemBuild: true,
        applicationUniversalIdentifier:
          TWENTY_STANDARD_APPLICATION_UNIVERSAL_IDENTIFIER,
        allFlatEntityOperationByMetadataName: {
          objectMetadata: {
            flatEntityToCreate: [],
            flatEntityToDelete: [],
            flatEntityToUpdate: [
              {
                ...thread,
                readability: MetadataReadability.PRIVATE,
                writability: MetadataWritability.OPEN,
              },
            ],
          },
          fieldMetadata: {
            flatEntityToCreate: [],
            flatEntityToDelete: [],
            flatEntityToUpdate: [
              {
                ...title,
                writability: MetadataWritability.OPEN,
              },
            ],
          },
        },
      });
    if (result.status === 'fail') {
      throw new Error(
        `Could not migrate conversation permissions: ${JSON.stringify(result)}`,
      );
    }
  }
}
