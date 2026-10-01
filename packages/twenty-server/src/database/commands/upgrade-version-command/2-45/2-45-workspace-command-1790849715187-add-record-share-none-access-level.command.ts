import { InjectDataSource } from '@nestjs/typeorm';

import { Command } from 'nest-commander';
import { TWENTY_STANDARD_APPLICATION_UNIVERSAL_IDENTIFIER } from 'twenty-shared/application';
import { STANDARD_OBJECTS } from 'twenty-shared/metadata';
import { RecordShareAccessLevel } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';
import { DataSource } from 'typeorm';

import { ProvisionedWorkspaceCommandRunner } from 'src/database/commands/command-runners/provisioned-workspace.command-runner';
import { WorkspaceIteratorService } from 'src/database/commands/command-runners/workspace-iterator.service';
import { type RunOnWorkspaceArgs } from 'src/database/commands/command-runners/workspace.command-runner';
import { buildRecordShareNoneAccessLevelOptionSyncOperations } from 'src/database/commands/upgrade-version-command/2-45/utils/build-record-share-none-access-level-option-sync-operations.util';
import { RegisteredWorkspaceCommand } from 'src/engine/core-modules/upgrade/decorators/registered-workspace-command.decorator';
import { computeObjectTargetTable } from 'src/engine/utils/compute-object-target-table.util';
import { WorkspaceCacheService } from 'src/engine/workspace-cache/services/workspace-cache.service';
import { getWorkspaceSchemaName } from 'src/engine/workspace-datasource/utils/get-workspace-schema-name.util';
import { WorkspaceMigrationBuilderException } from 'src/engine/workspace-manager/workspace-migration/exceptions/workspace-migration-builder-exception';
import { WorkspaceMigrationValidateBuildAndRunService } from 'src/engine/workspace-manager/workspace-migration/services/workspace-migration-validate-build-and-run-service';
import { escapeIdentifier } from 'src/engine/workspace-manager/workspace-migration/utils/remove-sql-injection.util';

@RegisteredWorkspaceCommand('2.45.0', 1790849715187)
@Command({
  name: 'upgrade:2-45:add-record-share-none-access-level',
  description:
    'Add the NONE access level that restricts a record of an object open by default',
})
export class AddRecordShareNoneAccessLevelCommand extends ProvisionedWorkspaceCommandRunner {
  constructor(
    protected readonly workspaceIteratorService: WorkspaceIteratorService,
    private readonly workspaceCacheService: WorkspaceCacheService,
    private readonly workspaceMigrationValidateBuildAndRunService: WorkspaceMigrationValidateBuildAndRunService,
    @InjectDataSource() private readonly dataSource: DataSource,
  ) {
    super(workspaceIteratorService);
  }

  override async runOnWorkspace(args: RunOnWorkspaceArgs): Promise<void> {
    await this.up(args);
  }

  async up(args: RunOnWorkspaceArgs): Promise<void> {
    await this.syncNoneAccessLevelOption(args, 'up');
  }

  async down(args: RunOnWorkspaceArgs): Promise<void> {
    await this.syncNoneAccessLevelOption(args, 'down');
  }

  private async syncNoneAccessLevelOption(
    { workspaceId, options }: RunOnWorkspaceArgs,
    direction: 'up' | 'down',
  ): Promise<void> {
    const { flatFieldMetadataMaps, flatObjectMetadataMaps } =
      await this.workspaceCacheService.getOrRecompute(workspaceId, [
        'flatFieldMetadataMaps',
        'flatObjectMetadataMaps',
      ]);

    const fieldMetadataOperations =
      buildRecordShareNoneAccessLevelOptionSyncOperations({
        existingFlatFieldMetadataMaps: flatFieldMetadataMaps,
        now: new Date().toISOString(),
        direction,
      });

    if (fieldMetadataOperations.flatEntityToUpdate.length === 0) {
      return;
    }

    this.logger.log(
      `${options.dryRun ? '[DRY RUN] ' : ''}Workspace ${workspaceId}: ${direction === 'up' ? 'adding' : 'removing'} the NONE record share access level`,
    );

    if (options.dryRun) {
      return;
    }

    const recordShareObjectMetadata =
      flatObjectMetadataMaps.byUniversalIdentifier[
        STANDARD_OBJECTS.recordShare.universalIdentifier
      ];

    const recordShareTable = isDefined(recordShareObjectMetadata)
      ? `${escapeIdentifier(getWorkspaceSchemaName(workspaceId))}.${escapeIdentifier(computeObjectTargetTable(recordShareObjectMetadata))}`
      : undefined;

    // Postgres cannot drop an enum value still in use, and a restriction
    // without the gate that reads it means nothing once rolled back
    const deletedRestrictions =
      direction === 'down' && isDefined(recordShareTable)
        ? await this.deleteRestrictions(recordShareTable)
        : [];

    try {
      const result =
        await this.workspaceMigrationValidateBuildAndRunService.validateBuildAndRunLegacyWorkspaceMigration(
          {
            workspaceId,
            isSystemBuild: true,
            applicationUniversalIdentifier:
              TWENTY_STANDARD_APPLICATION_UNIVERSAL_IDENTIFIER,
            allFlatEntityOperationByMetadataName: {
              fieldMetadata: fieldMetadataOperations,
            },
          },
        );

      if (result.status === 'fail') {
        this.logger.error(
          `Failed to ${direction === 'up' ? 'add' : 'remove'} the NONE record share access level for workspace ${workspaceId}:\n${JSON.stringify(result, null, 2)}`,
        );
        throw new WorkspaceMigrationBuilderException(result);
      }
    } catch (error) {
      if (isDefined(recordShareTable)) {
        await this.restoreRestrictions(recordShareTable, deletedRestrictions);
      }
      throw error;
    }
  }

  private async deleteRestrictions(
    recordShareTable: string,
  ): Promise<Record<string, unknown>[]> {
    const [rows]: [{ restriction: Record<string, unknown> }[], number] =
      await this.dataSource.query(
        `DELETE FROM ${recordShareTable} AS "recordShare" WHERE "accessLevel" = $1 RETURNING to_jsonb("recordShare") - 'searchVector' AS "restriction"`,
        [RecordShareAccessLevel.NONE],
      );

    return rows.map(({ restriction }) => restriction);
  }

  // The metadata migration runs in its own transaction, so restrictions
  // deleted ahead of it are put back when it fails
  private async restoreRestrictions(
    recordShareTable: string,
    restrictions: Record<string, unknown>[],
  ): Promise<void> {
    if (restrictions.length === 0) {
      return;
    }

    const columns = Object.keys(restrictions[0]).map(escapeIdentifier).join(', ');

    await this.dataSource.query(
      `INSERT INTO ${recordShareTable} (${columns}) SELECT ${columns} FROM jsonb_populate_recordset(NULL::${recordShareTable}, $1::jsonb)`,
      [JSON.stringify(restrictions)],
    );
  }
}
