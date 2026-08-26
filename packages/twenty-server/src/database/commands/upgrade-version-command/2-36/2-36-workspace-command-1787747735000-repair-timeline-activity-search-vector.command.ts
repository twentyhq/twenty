import { Command } from 'nest-commander';
import { STANDARD_OBJECTS } from 'twenty-shared/metadata';
import { isDefined } from 'twenty-shared/utils';

import { ProvisionedWorkspaceCommandRunner } from 'src/database/commands/command-runners/provisioned-workspace.command-runner';
import { WorkspaceIteratorService } from 'src/database/commands/command-runners/workspace-iterator.service';
import { type RunOnWorkspaceArgs } from 'src/database/commands/command-runners/workspace.command-runner';
import { RegisteredWorkspaceCommand } from 'src/engine/core-modules/upgrade/decorators/registered-workspace-command.decorator';
import { findFlatEntityByUniversalIdentifier } from 'src/engine/metadata-modules/flat-entity/utils/find-flat-entity-by-universal-identifier.util';
import { type FlatFieldMetadata } from 'src/engine/metadata-modules/flat-field-metadata/types/flat-field-metadata.type';
import { type FlatObjectMetadata } from 'src/engine/metadata-modules/flat-object-metadata/types/flat-object-metadata.type';
import { WorkspaceCacheService } from 'src/engine/workspace-cache/services/workspace-cache.service';
import { TWENTY_STANDARD_APPLICATION } from 'src/engine/workspace-manager/twenty-standard-application/constants/twenty-standard-applications';
import { type UniversalUpdateFieldAction } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-builder/builders/field/types/workspace-migration-field-action';
import { WORKSPACE_MIGRATION_ACTION_TYPE } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-builder/constants/workspace-migration-action-type.constant';
import { WorkspaceMigrationRunnerService } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-runner/services/workspace-migration-runner.service';
import { getWorkspaceSchemaContextForMigration } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-runner/utils/get-workspace-schema-context-for-migration.util';

@RegisteredWorkspaceCommand('2.36.0', 1787747735000)
@Command({
  name: 'upgrade:2-36:repair-timeline-activity-search-vector',
  description:
    'Recreate timelineActivity.searchVector when the legacy name column contraction removed it through a generated-column dependency',
})
export class RepairTimelineActivitySearchVectorCommand extends ProvisionedWorkspaceCommandRunner {
  constructor(
    protected readonly workspaceIteratorService: WorkspaceIteratorService,
    private readonly workspaceCacheService: WorkspaceCacheService,
    private readonly workspaceMigrationRunnerService: WorkspaceMigrationRunnerService,
  ) {
    super(workspaceIteratorService);
  }

  override async runOnWorkspace({
    workspaceId,
    dataSource,
    options,
  }: RunOnWorkspaceArgs): Promise<void> {
    const { flatObjectMetadataMaps, flatFieldMetadataMaps } =
      await this.workspaceCacheService.getOrRecompute(workspaceId, [
        'flatObjectMetadataMaps',
        'flatFieldMetadataMaps',
      ]);

    const timelineActivityObject =
      findFlatEntityByUniversalIdentifier<FlatObjectMetadata>({
        flatEntityMaps: flatObjectMetadataMaps,
        universalIdentifier:
          STANDARD_OBJECTS.timelineActivity.universalIdentifier,
      });
    const searchVectorField =
      findFlatEntityByUniversalIdentifier<FlatFieldMetadata>({
        flatEntityMaps: flatFieldMetadataMaps,
        universalIdentifier:
          STANDARD_OBJECTS.timelineActivity.fields.searchVector
            .universalIdentifier,
      });

    if (!isDefined(timelineActivityObject) || !isDefined(searchVectorField)) {
      return;
    }

    if (!isDefined(dataSource)) {
      throw new Error(
        `Cannot inspect timelineActivity.searchVector for workspace ${workspaceId} without a data source`,
      );
    }

    const { schemaName, tableName } = getWorkspaceSchemaContextForMigration({
      workspaceId,
      objectMetadata: timelineActivityObject,
    });
    const [searchVectorColumn] = await dataSource.query<
      Array<{ exists: boolean }>
    >(
      `SELECT EXISTS (
  SELECT 1
  FROM information_schema.columns
  WHERE table_schema = $1
    AND table_name = $2
    AND column_name = $3
) AS "exists"`,
      [schemaName, tableName, searchVectorField.name],
    );

    if (searchVectorColumn?.exists === true) {
      return;
    }

    const isDryRun = options.dryRun ?? false;

    this.logger.log(
      `${isDryRun ? '[DRY RUN] ' : ''}Repairing missing timelineActivity.searchVector for workspace ${workspaceId}`,
    );

    if (isDryRun) {
      return;
    }

    const rebuildSearchVectorAction: UniversalUpdateFieldAction = {
      type: WORKSPACE_MIGRATION_ACTION_TYPE.update,
      metadataName: 'fieldMetadata',
      universalIdentifier: searchVectorField.universalIdentifier,
      update: {},
      rebuildSearchVector: true,
    };

    await this.workspaceMigrationRunnerService.run({
      workspaceMigration: {
        applicationUniversalIdentifier:
          TWENTY_STANDARD_APPLICATION.universalIdentifier,
        actions: [rebuildSearchVectorAction],
      },
      workspaceId,
    });
  }
}
