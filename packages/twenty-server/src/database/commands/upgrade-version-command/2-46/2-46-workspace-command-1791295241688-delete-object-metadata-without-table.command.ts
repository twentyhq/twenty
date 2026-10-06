import { Command } from 'nest-commander';
import { ALL_METADATA_NAME } from 'twenty-shared/metadata';
import { isDefined } from 'twenty-shared/utils';

import { ProvisionedWorkspaceCommandRunner } from 'src/database/commands/command-runners/provisioned-workspace.command-runner';
import { WorkspaceIteratorService } from 'src/database/commands/command-runners/workspace-iterator.service';
import { type RunOnWorkspaceArgs } from 'src/database/commands/command-runners/workspace.command-runner';
import { findObjectMetadataWithoutTable } from 'src/database/commands/upgrade-version-command/2-46/utils/find-object-metadata-without-table.util';
import { readExistingTableNames } from 'src/database/commands/upgrade-version-command/2-46/utils/read-existing-table-names.util';
import { ApplicationService } from 'src/engine/core-modules/application/application.service';
import { RegisteredWorkspaceCommand } from 'src/engine/core-modules/upgrade/decorators/registered-workspace-command.decorator';
import { getMetadataFlatEntityMapsKey } from 'src/engine/metadata-modules/flat-entity/utils/get-metadata-flat-entity-maps-key.util';
import { computeObjectTargetTable } from 'src/engine/utils/compute-object-target-table.util';
import { WorkspaceCacheService } from 'src/engine/workspace-cache/services/workspace-cache.service';
import { getWorkspaceSchemaName } from 'src/engine/workspace-datasource/utils/get-workspace-schema-name.util';
import { WorkspaceMigrationValidateBuildAndRunService } from 'src/engine/workspace-manager/workspace-migration/services/workspace-migration-validate-build-and-run-service';

@RegisteredWorkspaceCommand('2.46.0', 1791295241688)
@Command({
  name: 'upgrade:2-46:delete-object-metadata-without-table',
  description:
    'Delete workspace custom object metadata whose workspace table does not exist, such as the pre-1.10 view objects (view, viewField...) that 1.16 moved to the workspace custom application and 2.12 pointed at a never-created prefixed table. Objects of other applications are reported, never deleted, and tables left behind under an older name are kept untouched.',
})
export class DeleteObjectMetadataWithoutTableCommand extends ProvisionedWorkspaceCommandRunner {
  constructor(
    protected readonly workspaceIteratorService: WorkspaceIteratorService,
    private readonly applicationService: ApplicationService,
    private readonly workspaceCacheService: WorkspaceCacheService,
    private readonly workspaceMigrationValidateBuildAndRunService: WorkspaceMigrationValidateBuildAndRunService,
  ) {
    super(workspaceIteratorService);
  }

  override async runOnWorkspace({
    workspaceId,
    dataSource,
    options,
  }: RunOnWorkspaceArgs): Promise<void> {
    const isDryRun = options.dryRun ?? false;

    if (!isDefined(dataSource)) {
      this.logger.error(
        `Cannot read the workspace schema of workspace ${workspaceId}: no data source. Skipping, rerun once the workspace is reachable.`,
      );

      return;
    }

    const { flatObjectMetadataMaps, flatFieldMetadataMaps } =
      await this.workspaceCacheService.getOrRecompute(workspaceId, [
        'flatObjectMetadataMaps',
        'flatFieldMetadataMaps',
      ]);

    const { twentyStandardFlatApplication, workspaceCustomFlatApplication } =
      await this.applicationService.findWorkspaceTwentyStandardAndCustomApplicationOrThrow(
        { workspaceId },
      );

    const flatObjectMetadatas = Object.values(
      flatObjectMetadataMaps.byUniversalIdentifier,
    ).filter(isDefined);

    const existingTableNames = await readExistingTableNames({
      dataSource,
      schemaName: getWorkspaceSchemaName(workspaceId),
      tableNames: flatObjectMetadatas.flatMap((flatObjectMetadata) => [
        computeObjectTargetTable(flatObjectMetadata),
        flatObjectMetadata.nameSingular,
      ]),
    });

    const hasStandardObjectTable = flatObjectMetadatas.some(
      (flatObjectMetadata) =>
        flatObjectMetadata.applicationUniversalIdentifier ===
          twentyStandardFlatApplication.universalIdentifier &&
        existingTableNames.has(computeObjectTargetTable(flatObjectMetadata)),
    );

    if (!hasStandardObjectTable) {
      this.logger.error(
        `No standard object table found in the schema of workspace ${workspaceId}: the schema is missing or unreachable. Skipping.`,
      );

      return;
    }

    const {
      deletableFlatObjectMetadatas,
      inverseFlatFieldMetadatasToDelete,
      nonDeletableFlatObjectMetadatas,
    } = findObjectMetadataWithoutTable({
      flatObjectMetadataMaps,
      flatFieldMetadataMaps,
      existingTableNames,
      workspaceCustomApplicationUniversalIdentifier:
        workspaceCustomFlatApplication.universalIdentifier,
    });

    if (nonDeletableFlatObjectMetadatas.length > 0) {
      this.logger.error(
        [
          `MANUAL REPAIR REQUIRED: ${nonDeletableFlatObjectMetadatas.length} object(s) in workspace ${workspaceId} have no table and are not workspace custom objects, so they were not deleted:`,
          ...nonDeletableFlatObjectMetadatas.map(
            (flatObjectMetadata) =>
              `  - ${flatObjectMetadata.nameSingular} (application ${flatObjectMetadata.applicationUniversalIdentifier}): table "${computeObjectTargetTable(flatObjectMetadata)}" does not exist`,
          ),
        ].join('\n'),
      );
    }

    if (deletableFlatObjectMetadatas.length === 0) {
      if (nonDeletableFlatObjectMetadatas.length === 0) {
        this.logger.log(
          `Every object has a table in workspace ${workspaceId}, skipping`,
        );
      }

      return;
    }

    this.logger.log(
      `${isDryRun ? '[DRY RUN] ' : ''}Deleting ${deletableFlatObjectMetadatas.length} object(s) without table and ${inverseFlatFieldMetadatasToDelete.length} relation field(s) pointing at them for workspace ${workspaceId}: ${deletableFlatObjectMetadatas
        .map(({ nameSingular }) => nameSingular)
        .join(', ')}`,
    );

    const leftoverTableNames = deletableFlatObjectMetadatas
      .map(({ nameSingular }) => nameSingular)
      .filter((nameSingular) => existingTableNames.has(nameSingular));

    if (leftoverTableNames.length > 0) {
      this.logger.warn(
        `Table(s) ${leftoverTableNames.map((tableName) => `"${tableName}"`).join(', ')} in workspace ${workspaceId} no longer match any object and are left untouched`,
      );
    }

    if (isDryRun) {
      return;
    }

    // A cleanup failure must not block the upgrade: the workspace is left as
    // it was, since the migration runs in a single transaction.
    try {
      // The side-effect engine would add the deletion of each object's own
      // fields, whose DROP COLUMN fails on the missing table. Core foreign
      // keys cascade those rows instead.
      const result =
        await this.workspaceMigrationValidateBuildAndRunService.validateBuildAndRunLegacyWorkspaceMigration(
          {
            isSystemBuild: true,
            workspaceId,
            applicationUniversalIdentifier:
              workspaceCustomFlatApplication.universalIdentifier,
            allFlatEntityOperationByMetadataName: {
              objectMetadata: {
                flatEntityToCreate: [],
                flatEntityToDelete: deletableFlatObjectMetadatas,
                flatEntityToUpdate: [],
              },
              fieldMetadata: {
                flatEntityToCreate: [],
                flatEntityToDelete: inverseFlatFieldMetadatasToDelete,
                flatEntityToUpdate: [],
              },
            },
          },
        );

      if (result.status === 'fail') {
        this.logger.error(
          `MANUAL REPAIR REQUIRED: failed to delete the objects without table of workspace ${workspaceId}:\n${JSON.stringify(result, null, 2)}`,
        );

        return;
      }
    } catch (error) {
      this.logger.error(
        `MANUAL REPAIR REQUIRED: failed to delete the objects without table of workspace ${workspaceId}: ${error instanceof Error ? error.message : String(error)}`,
      );

      return;
    }

    // Views, permissions and layouts of the deleted objects go through core
    // foreign key cascades, which the runner's cache recompute does not see.
    await this.workspaceCacheService.invalidateAndRecompute(
      workspaceId,
      Object.values(ALL_METADATA_NAME).map(getMetadataFlatEntityMapsKey),
    );

    this.logger.log(
      `Deleted ${deletableFlatObjectMetadatas.length} object(s) without table for workspace ${workspaceId}`,
    );
  }
}
