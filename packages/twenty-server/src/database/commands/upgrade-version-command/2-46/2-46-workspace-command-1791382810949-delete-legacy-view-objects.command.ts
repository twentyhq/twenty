import { Command } from 'nest-commander';
import { ALL_METADATA_NAME } from 'twenty-shared/metadata';
import { isDefined } from 'twenty-shared/utils';

import { ProvisionedWorkspaceCommandRunner } from 'src/database/commands/command-runners/provisioned-workspace.command-runner';
import { WorkspaceIteratorService } from 'src/database/commands/command-runners/workspace-iterator.service';
import { type RunOnWorkspaceArgs } from 'src/database/commands/command-runners/workspace.command-runner';
import {
  findLegacyViewObjectsToDelete,
  LEGACY_VIEW_OBJECT_NAME_SINGULARS,
} from 'src/database/commands/upgrade-version-command/2-46/utils/find-legacy-view-objects-to-delete.util';
import { readExistingTableNames } from 'src/database/commands/upgrade-version-command/2-46/utils/read-existing-table-names.util';
import { ApplicationService } from 'src/engine/core-modules/application/application.service';
import { RegisteredWorkspaceCommand } from 'src/engine/core-modules/upgrade/decorators/registered-workspace-command.decorator';
import { getMetadataFlatEntityMapsKey } from 'src/engine/metadata-modules/flat-entity/utils/get-metadata-flat-entity-maps-key.util';
import { computeObjectTargetTable } from 'src/engine/utils/compute-object-target-table.util';
import { WorkspaceCacheService } from 'src/engine/workspace-cache/services/workspace-cache.service';
import { getWorkspaceSchemaName } from 'src/engine/workspace-datasource/utils/get-workspace-schema-name.util';
import { WorkspaceMigrationValidateBuildAndRunService } from 'src/engine/workspace-manager/workspace-migration/services/workspace-migration-validate-build-and-run-service';

@RegisteredWorkspaceCommand('2.46.0', 1791382810949)
@Command({
  name: 'upgrade:2-46:delete-legacy-view-objects',
  description:
    'Delete the pre-1.10 workspace view objects (view, viewField, viewFilter, viewFilterGroup, viewGroup, viewSort) left in old workspaces. 1.16 moved them to the workspace custom application and 2.12 pointed them at a prefixed table that was never created. Only workspace custom objects with one of these names and no such table are deleted; tables left under the unprefixed name are kept.',
})
export class DeleteLegacyViewObjectsCommand extends ProvisionedWorkspaceCommandRunner {
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

    const { flatObjectMetadataMaps, flatFieldMetadataMaps } =
      await this.workspaceCacheService.getOrRecompute(workspaceId, [
        'flatObjectMetadataMaps',
        'flatFieldMetadataMaps',
      ]);

    const flatObjectMetadatas = Object.values(
      flatObjectMetadataMaps.byUniversalIdentifier,
    ).filter(isDefined);

    const legacyViewFlatObjectMetadatas = flatObjectMetadatas.filter(
      ({ nameSingular }) =>
        LEGACY_VIEW_OBJECT_NAME_SINGULARS.includes(nameSingular),
    );

    if (legacyViewFlatObjectMetadatas.length === 0) {
      this.logger.log(
        `No legacy view object in workspace ${workspaceId}, skipping`,
      );

      return;
    }

    if (!isDefined(dataSource)) {
      this.logger.error(
        `Cannot read the workspace schema of workspace ${workspaceId}: no data source. Skipping, rerun once the workspace is reachable.`,
      );

      return;
    }

    const { twentyStandardFlatApplication, workspaceCustomFlatApplication } =
      await this.applicationService.findWorkspaceTwentyStandardAndCustomApplicationOrThrow(
        { workspaceId },
      );

    const standardTableNames = flatObjectMetadatas
      .filter(
        ({ applicationUniversalIdentifier }) =>
          applicationUniversalIdentifier ===
          twentyStandardFlatApplication.universalIdentifier,
      )
      .map((flatObjectMetadata) => computeObjectTargetTable(flatObjectMetadata));

    const existingTableNames = await readExistingTableNames({
      dataSource,
      schemaName: getWorkspaceSchemaName(workspaceId),
      tableNames: [
        ...standardTableNames,
        ...legacyViewFlatObjectMetadatas.flatMap((flatObjectMetadata) => [
          computeObjectTargetTable(flatObjectMetadata),
          flatObjectMetadata.nameSingular,
        ]),
      ],
    });

    // Every legacy table would look missing in a schema we failed to read.
    if (
      !standardTableNames.some((tableName) => existingTableNames.has(tableName))
    ) {
      this.logger.error(
        `No standard object table found in the schema of workspace ${workspaceId}: the schema is missing or unreachable. Skipping.`,
      );

      return;
    }

    const {
      flatObjectMetadatasToDelete,
      inverseFlatFieldMetadatasToDelete,
      keptFlatObjectMetadatas,
    } = findLegacyViewObjectsToDelete({
      flatObjectMetadataMaps,
      flatFieldMetadataMaps,
      existingTableNames,
      workspaceCustomApplicationUniversalIdentifier:
        workspaceCustomFlatApplication.universalIdentifier,
    });

    for (const { flatObjectMetadata, reason } of keptFlatObjectMetadatas) {
      this.logger.log(
        `Keeping object ${flatObjectMetadata.nameSingular} of workspace ${workspaceId}: ${reason}`,
      );
    }

    if (flatObjectMetadatasToDelete.length === 0) {
      return;
    }

    this.logger.log(
      `${isDryRun ? '[DRY RUN] ' : ''}Deleting legacy view object(s) ${flatObjectMetadatasToDelete
        .map(({ nameSingular }) => nameSingular)
        .join(
          ', ',
        )} and ${inverseFlatFieldMetadatasToDelete.length} relation field(s) pointing at them for workspace ${workspaceId}`,
    );

    const leftoverTableNames = flatObjectMetadatasToDelete
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
                flatEntityToDelete: flatObjectMetadatasToDelete,
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
          `MANUAL REPAIR REQUIRED: failed to delete the legacy view objects of workspace ${workspaceId}:\n${JSON.stringify(result, null, 2)}`,
        );

        return;
      }
    } catch (error) {
      this.logger.error(
        `MANUAL REPAIR REQUIRED: failed to delete the legacy view objects of workspace ${workspaceId}: ${error instanceof Error ? error.message : String(error)}`,
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
      `Deleted ${flatObjectMetadatasToDelete.length} legacy view object(s) for workspace ${workspaceId}`,
    );
  }
}
