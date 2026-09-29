import { InjectDataSource } from '@nestjs/typeorm';
import { Command } from 'nest-commander';
import { DataSource } from 'typeorm';

import { ProvisionedWorkspaceCommandRunner } from 'src/database/commands/command-runners/provisioned-workspace.command-runner';
import { WorkspaceIteratorService } from 'src/database/commands/command-runners/workspace-iterator.service';
import { type RunOnWorkspaceArgs } from 'src/database/commands/command-runners/workspace.command-runner';
import { buildChannelRecordShareBackfillQueries } from 'src/database/commands/upgrade-version-command/2-44/utils/build-channel-record-share-backfill-queries.util';
import {
  buildDiscoverableEmailAndCalendarObjectUpdates,
  buildRevertedEmailAndCalendarObjectUpdates,
} from 'src/database/commands/upgrade-version-command/2-44/utils/build-discoverable-email-and-calendar-object-updates.util';
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
@RegisteredWorkspaceCommand('2.44.0', 1790719968325)
@Command({
  name: 'upgrade:2-44:share-email-and-calendar-through-record-shares',
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

  private async grantChannelRecords(workspaceId: string): Promise<void> {
    const schemaName = escapeIdentifier(getWorkspaceSchemaName(workspaceId));

    await this.dataSource.transaction(async (manager) => {
      for (const query of buildChannelRecordShareBackfillQueries(schemaName)) {
        await manager.query(query, [workspaceId]);
      }
    });
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
