import { InjectDataSource } from '@nestjs/typeorm';
import { Command } from 'nest-commander';
import { STANDARD_OBJECTS } from 'twenty-shared/metadata';
import { isDefined } from 'twenty-shared/utils';
import { DataSource } from 'typeorm';

import { ProvisionedWorkspaceCommandRunner } from 'src/database/commands/command-runners/provisioned-workspace.command-runner';
import { WorkspaceIteratorService } from 'src/database/commands/command-runners/workspace-iterator.service';
import { type RunOnWorkspaceArgs } from 'src/database/commands/command-runners/workspace.command-runner';
import {
  buildChannelRecordShareBackfillQueries,
  CHANNEL_RECORD_SHARE_BACKFILL_SOURCES,
} from 'src/database/commands/upgrade-version-command/2-45/utils/build-channel-record-share-backfill-queries.util';
import {
  buildDiscoverableEmailAndCalendarObjectUpdates,
  buildRevertedEmailAndCalendarObjectUpdates,
} from 'src/database/commands/upgrade-version-command/2-45/utils/build-discoverable-email-and-calendar-object-updates.util';
import { ApplicationService } from 'src/engine/core-modules/application/application.service';
import { RegisteredWorkspaceCommand } from 'src/engine/core-modules/upgrade/decorators/registered-workspace-command.decorator';
import { type FlatObjectMetadata } from 'src/engine/metadata-modules/flat-object-metadata/types/flat-object-metadata.type';
import { WorkspaceCacheService } from 'src/engine/workspace-cache/services/workspace-cache.service';
import { getWorkspaceSchemaName } from 'src/engine/workspace-datasource/utils/get-workspace-schema-name.util';
import { WorkspaceMigrationBuilderException } from 'src/engine/workspace-manager/workspace-migration/exceptions/workspace-migration-builder-exception';
import { WorkspaceMigrationValidateBuildAndRunService } from 'src/engine/workspace-manager/workspace-migration/services/workspace-migration-validate-build-and-run-service';
import { escapeIdentifier } from 'src/engine/workspace-manager/workspace-migration/utils/remove-sql-injection.util';

// Threads and events were gated per channel by post-query hooks. Record shares
// now decide who reads them: the members who synced them own them, and a
// channel that shares everything grants everyone. Grants are written before
// readability changes, so nobody loses access in between.
@RegisteredWorkspaceCommand('2.45.0', 1790840223721)
@Command({
  name: 'upgrade:2-45:share-email-and-calendar-through-record-shares',
  description:
    'Grant message threads and calendar events to the members and channels that synced them, then make them discoverable',
})
export class ShareEmailAndCalendarThroughRecordSharesCommand extends ProvisionedWorkspaceCommandRunner {
  constructor(
    protected readonly workspaceIteratorService: WorkspaceIteratorService,
    private readonly applicationService: ApplicationService,
    private readonly workspaceCacheService: WorkspaceCacheService,
    private readonly workspaceMigrationValidateBuildAndRunService: WorkspaceMigrationValidateBuildAndRunService,
    @InjectDataSource() private readonly dataSource: DataSource,
  ) {
    super(workspaceIteratorService);
  }

  override async runOnWorkspace(args: RunOnWorkspaceArgs): Promise<void> {
    await this.up(args);
  }

  async up({ workspaceId, options }: RunOnWorkspaceArgs): Promise<void> {
    const { flatObjectMetadataMaps, flatFieldMetadataMaps } =
      await this.workspaceCacheService.getOrRecompute(workspaceId, [
        'flatObjectMetadataMaps',
        'flatFieldMetadataMaps',
      ]);

    if (
      !isDefined(
        flatObjectMetadataMaps.byUniversalIdentifier[
          STANDARD_OBJECTS.recordShare.universalIdentifier
        ],
      )
    ) {
      this.logger.log(
        `Record share object missing for workspace ${workspaceId}, skipping`,
      );

      return;
    }

    const flatObjectMetadatasToUpdate =
      buildDiscoverableEmailAndCalendarObjectUpdates({
        flatObjectMetadataMaps,
        flatFieldMetadataMaps,
      });

    if (options.dryRun ?? false) {
      this.logger.log(
        `[DRY RUN] Would grant message threads and calendar events to their channels and update ${flatObjectMetadatasToUpdate.length} objects for workspace ${workspaceId}`,
      );

      return;
    }

    await this.grantChannelRecords(workspaceId);

    if (flatObjectMetadatasToUpdate.length === 0) {
      return;
    }

    await this.updateObjects(workspaceId, flatObjectMetadatasToUpdate);
  }

  async down({ workspaceId }: RunOnWorkspaceArgs): Promise<void> {
    const { flatObjectMetadataMaps } =
      await this.workspaceCacheService.getOrRecompute(workspaceId, [
        'flatObjectMetadataMaps',
      ]);

    // The grants stay: they are inert once the objects are open again.
    await this.updateObjects(
      workspaceId,
      buildRevertedEmailAndCalendarObjectUpdates({ flatObjectMetadataMaps }),
    );
  }

  // One channel per transaction, under the lock the runtime channel sync takes,
  // so a concurrent sync cannot have its revocations reinserted from an older
  // snapshot. The key format must match the runtime sync.
  private async grantChannelRecords(workspaceId: string): Promise<void> {
    const schemaName = escapeIdentifier(getWorkspaceSchemaName(workspaceId));

    for (const source of CHANNEL_RECORD_SHARE_BACKFILL_SOURCES) {
      const queries = buildChannelRecordShareBackfillQueries({
        schemaName,
        source,
      });
      const channels: { id: string }[] = await this.dataSource.query(
        `SELECT id FROM core."${source.channelTableName}" WHERE "workspaceId" = $1`,
        [workspaceId],
      );

      for (const { id: channelId } of channels) {
        await this.dataSource.transaction(async (manager) => {
          await manager.query(
            'SELECT pg_advisory_xact_lock(hashtextextended($1, 0))',
            [`channel-record-share:${workspaceId}:${channelId}`],
          );

          for (const query of queries) {
            await manager.query(query, [workspaceId, channelId]);
          }
        });
      }
    }
  }

  private async updateObjects(
    workspaceId: string,
    flatObjectMetadatasToUpdate: FlatObjectMetadata[],
  ): Promise<void> {
    const { twentyStandardFlatApplication } =
      await this.applicationService.findWorkspaceTwentyStandardAndCustomApplicationOrThrow(
        { workspaceId },
      );

    const result =
      await this.workspaceMigrationValidateBuildAndRunService.validateBuildAndRunLegacyWorkspaceMigration(
        {
          workspaceId,
          isSystemBuild: true,
          applicationUniversalIdentifier:
            twentyStandardFlatApplication.universalIdentifier,
          allFlatEntityOperationByMetadataName: {
            objectMetadata: {
              flatEntityToCreate: [],
              flatEntityToDelete: [],
              flatEntityToUpdate: flatObjectMetadatasToUpdate,
            },
          },
        },
      );

    if (result.status === 'fail') {
      throw new WorkspaceMigrationBuilderException(result);
    }
  }
}
