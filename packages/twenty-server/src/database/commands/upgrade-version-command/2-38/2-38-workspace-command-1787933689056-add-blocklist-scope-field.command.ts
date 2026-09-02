import { Command } from 'nest-commander';

import { STANDARD_OBJECTS } from 'twenty-shared/metadata';
import { RelationOnDeleteAction } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';
import { type DataSource } from 'typeorm';

import { ProvisionedWorkspaceCommandRunner } from 'src/database/commands/command-runners/provisioned-workspace.command-runner';
import { WorkspaceIteratorService } from 'src/database/commands/command-runners/workspace-iterator.service';
import { type RunOnWorkspaceArgs } from 'src/database/commands/command-runners/workspace.command-runner';
import { ApplicationService } from 'src/engine/core-modules/application/application.service';
import { RegisteredWorkspaceCommand } from 'src/engine/core-modules/upgrade/decorators/registered-workspace-command.decorator';
import { findFlatEntityByUniversalIdentifier } from 'src/engine/metadata-modules/flat-entity/utils/find-flat-entity-by-universal-identifier.util';
import { type FlatFieldMetadata } from 'src/engine/metadata-modules/flat-field-metadata/types/flat-field-metadata.type';
import { type FlatObjectMetadata } from 'src/engine/metadata-modules/flat-object-metadata/types/flat-object-metadata.type';
import { WorkspaceSchemaManagerService } from 'src/engine/twenty-orm/workspace-schema-manager/workspace-schema-manager.service';
import { computeTableName } from 'src/engine/utils/compute-table-name.util';
import { WorkspaceCacheService } from 'src/engine/workspace-cache/services/workspace-cache.service';
import { getWorkspaceSchemaName } from 'src/engine/workspace-datasource/utils/get-workspace-schema-name.util';
import { computeTwentyStandardApplicationAllFlatEntityMaps } from 'src/engine/workspace-manager/twenty-standard-application/utils/twenty-standard-application-all-flat-entity-maps.constant';
import { WorkspaceMigrationValidateBuildAndRunService } from 'src/engine/workspace-manager/workspace-migration/services/workspace-migration-validate-build-and-run-service';

const BLOCKLIST = STANDARD_OBJECTS.blocklist;
const SCOPE_FIELD_UNIVERSAL_IDENTIFIER =
  BLOCKLIST.fields.scope.universalIdentifier;
const WORKSPACE_MEMBER_FIELD_UNIVERSAL_IDENTIFIER =
  BLOCKLIST.fields.workspaceMember.universalIdentifier;
const BLOCKLIST_OBJECT_NAME_SINGULAR = 'blocklist';
const WORKSPACE_MEMBER_TABLE_NAME = 'workspaceMember';
const WORKSPACE_MEMBER_COLUMN_NAME = 'workspaceMemberId';

@RegisteredWorkspaceCommand('2.38.0', 1787933689056)
@Command({
  name: 'upgrade:2-38:add-blocklist-scope-field',
  description:
    'Add the blocklist.scope field, make blocklist.workspaceMember nullable so a handle can be blocked workspace-wide, and switch that relation from SET_NULL to CASCADE so a destroyed workspace member takes their entries with them',
})
export class AddBlocklistScopeFieldCommand extends ProvisionedWorkspaceCommandRunner {
  constructor(
    protected readonly workspaceIteratorService: WorkspaceIteratorService,
    private readonly applicationService: ApplicationService,
    private readonly workspaceCacheService: WorkspaceCacheService,
    private readonly workspaceSchemaManagerService: WorkspaceSchemaManagerService,
    private readonly workspaceMigrationValidateBuildAndRunService: WorkspaceMigrationValidateBuildAndRunService,
  ) {
    super(workspaceIteratorService);
  }

  override async runOnWorkspace({
    workspaceId,
    options,
    dataSource,
  }: RunOnWorkspaceArgs): Promise<void> {
    const isDryRun = options.dryRun ?? false;

    const { flatFieldMetadataMaps, flatObjectMetadataMaps } =
      await this.workspaceCacheService.getOrRecompute(workspaceId, [
        'flatFieldMetadataMaps',
        'flatObjectMetadataMaps',
      ]);

    const blocklistObjectMetadata =
      findFlatEntityByUniversalIdentifier<FlatObjectMetadata>({
        flatEntityMaps: flatObjectMetadataMaps,
        universalIdentifier: BLOCKLIST.universalIdentifier,
      });

    if (!isDefined(blocklistObjectMetadata)) {
      this.logger.log(
        `Blocklist object does not exist for workspace ${workspaceId}, skipping`,
      );

      return;
    }

    const workspaceMemberField =
      findFlatEntityByUniversalIdentifier<FlatFieldMetadata>({
        flatEntityMaps: flatFieldMetadataMaps,
        universalIdentifier: WORKSPACE_MEMBER_FIELD_UNIVERSAL_IDENTIFIER,
      });

    if (!isDefined(workspaceMemberField)) {
      throw new Error(
        `Blocklist workspaceMember field is missing for workspace ${workspaceId}`,
      );
    }

    const workspaceMemberRelationSettings = workspaceMemberField.settings;

    if (
      !isDefined(workspaceMemberRelationSettings) ||
      !('relationType' in workspaceMemberRelationSettings)
    ) {
      throw new Error(
        `Blocklist workspaceMember metadata is not a relation for workspace ${workspaceId}`,
      );
    }

    const isScopeFieldMissing = !isDefined(
      findFlatEntityByUniversalIdentifier<FlatFieldMetadata>({
        flatEntityMaps: flatFieldMetadataMaps,
        universalIdentifier: SCOPE_FIELD_UNIVERSAL_IDENTIFIER,
      }),
    );
    const isWorkspaceMemberRelationOutdated =
      !workspaceMemberField.isNullable ||
      workspaceMemberRelationSettings.onDelete !==
        RelationOnDeleteAction.CASCADE;

    if (!isScopeFieldMissing && !isWorkspaceMemberRelationOutdated) {
      return;
    }

    const { twentyStandardFlatApplication } =
      await this.applicationService.findWorkspaceTwentyStandardAndCustomApplicationOrThrow(
        { workspaceId },
      );

    const { allFlatEntityMaps: standardAllFlatEntityMaps } =
      computeTwentyStandardApplicationAllFlatEntityMaps({
        now: new Date().toISOString(),
        workspaceId,
        twentyStandardApplicationId: twentyStandardFlatApplication.id,
      });

    const standardScopeField =
      findFlatEntityByUniversalIdentifier<FlatFieldMetadata>({
        flatEntityMaps: standardAllFlatEntityMaps.flatFieldMetadataMaps,
        universalIdentifier: SCOPE_FIELD_UNIVERSAL_IDENTIFIER,
      });

    if (!isDefined(standardScopeField)) {
      throw new Error('Standard application is missing blocklist field scope');
    }

    if (isDryRun) {
      this.logger.log(
        `[DRY RUN] Would apply the blocklist workspace-scope migration for workspace ${workspaceId}: scope field ${isScopeFieldMissing ? 'missing' : 'present'}, workspaceMember relation ${isWorkspaceMemberRelationOutdated ? 'outdated' : 'up to date'}`,
      );

      return;
    }

    const flatFieldMetadataToCreate: FlatFieldMetadata[] = [];

    if (isScopeFieldMissing) {
      flatFieldMetadataToCreate.push({
        ...standardScopeField,
        viewFieldIds: [],
        viewFieldUniversalIdentifiers: [],
      });
    }

    const result =
      await this.workspaceMigrationValidateBuildAndRunService.validateBuildAndRunLegacyWorkspaceMigration(
        {
          isSystemBuild: true,
          workspaceId,
          applicationUniversalIdentifier:
            twentyStandardFlatApplication.universalIdentifier,
          allFlatEntityOperationByMetadataName: {
            fieldMetadata: {
              flatEntityToCreate: flatFieldMetadataToCreate,
              flatEntityToDelete: [],
              flatEntityToUpdate: [],
            },
          },
        },
      );

    if (result.status === 'fail') {
      throw new Error(
        `Failed to add the blocklist scope field for workspace ${workspaceId}: ${JSON.stringify(
          result,
          null,
          2,
        )}`,
      );
    }

    if (isWorkspaceMemberRelationOutdated) {
      if (!isDefined(dataSource)) {
        throw new Error(
          `No data source available to make the blocklist workspaceMember relation optional for workspace ${workspaceId}`,
        );
      }

      await this.makeWorkspaceMemberRelationOptional({
        dataSource,
        workspaceId,
        fieldMetadataId: workspaceMemberField.id,
      });
    }

    this.logger.log(
      `Applied the blocklist workspace-scope migration for workspace ${workspaceId}`,
    );
  }

  private async makeWorkspaceMemberRelationOptional({
    dataSource,
    workspaceId,
    fieldMetadataId,
  }: {
    dataSource: DataSource;
    workspaceId: string;
    fieldMetadataId: string;
  }): Promise<void> {
    const schemaName = getWorkspaceSchemaName(workspaceId);
    const tableName = computeTableName(BLOCKLIST_OBJECT_NAME_SINGULAR, false);
    const queryRunner = dataSource.createQueryRunner();

    await queryRunner.connect();

    try {
      await queryRunner.startTransaction();

      await this.workspaceSchemaManagerService.columnManager.alterColumnNullable(
        {
          queryRunner,
          schemaName,
          tableName,
          columnName: WORKSPACE_MEMBER_COLUMN_NAME,
          isNullable: true,
        },
      );

      const foreignKeyName =
        await this.workspaceSchemaManagerService.foreignKeyManager.getForeignKeyName(
          {
            queryRunner,
            schemaName,
            tableName,
            columnName: WORKSPACE_MEMBER_COLUMN_NAME,
          },
        );

      if (isDefined(foreignKeyName)) {
        await this.workspaceSchemaManagerService.foreignKeyManager.dropForeignKey(
          { queryRunner, schemaName, tableName, foreignKeyName },
        );
      }

      await this.workspaceSchemaManagerService.foreignKeyManager.createForeignKey(
        {
          queryRunner,
          schemaName,
          foreignKey: {
            tableName,
            columnName: WORKSPACE_MEMBER_COLUMN_NAME,
            referencedTableName: WORKSPACE_MEMBER_TABLE_NAME,
            referencedColumnName: 'id',
            onDelete: RelationOnDeleteAction.CASCADE,
          },
        },
      );

      await queryRunner.query(
        `UPDATE "core"."fieldMetadata"
            SET "isNullable" = true,
                "settings" = jsonb_set(
                  COALESCE("settings", '{}'::jsonb),
                  '{onDelete}',
                  to_jsonb($1::text)
                ),
                "updatedAt" = now()
          WHERE "id" = $2
            AND "workspaceId" = $3`,
        [RelationOnDeleteAction.CASCADE, fieldMetadataId, workspaceId],
      );

      await queryRunner.commitTransaction();
    } catch (error) {
      await queryRunner.rollbackTransaction();

      throw error;
    } finally {
      await queryRunner.release();
    }

    await this.workspaceCacheService.invalidateAndRecompute(workspaceId, [
      'flatFieldMetadataMaps',
      'flatObjectMetadataMaps',
    ]);
  }
}
