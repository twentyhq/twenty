import { InjectDataSource } from '@nestjs/typeorm';

import { Command } from 'nest-commander';
import { STANDARD_OBJECTS } from 'twenty-shared/metadata';
import { isDefined } from 'twenty-shared/utils';
import { DataSource } from 'typeorm';

import { ProvisionedWorkspaceCommandRunner } from 'src/database/commands/command-runners/provisioned-workspace.command-runner';
import { WorkspaceIteratorService } from 'src/database/commands/command-runners/workspace-iterator.service';
import { type RunOnWorkspaceArgs } from 'src/database/commands/command-runners/workspace.command-runner';
import { getStandardFlatEntitiesToCreateOrThrow } from 'src/database/commands/upgrade-version-command/2-10/utils/get-standard-flat-entities-to-create-or-throw.util';
import { ApplicationService } from 'src/engine/core-modules/application/application.service';
import { RegisteredWorkspaceCommand } from 'src/engine/core-modules/upgrade/decorators/registered-workspace-command.decorator';
import { type FlatIndexMetadata } from 'src/engine/metadata-modules/flat-index-metadata/types/flat-index-metadata.type';
import { WorkspaceCacheService } from 'src/engine/workspace-cache/services/workspace-cache.service';
import { getWorkspaceSchemaName } from 'src/engine/workspace-datasource/utils/get-workspace-schema-name.util';
import { computeTwentyStandardApplicationAllFlatEntityMaps } from 'src/engine/workspace-manager/twenty-standard-application/utils/twenty-standard-application-all-flat-entity-maps.constant';
import { WorkspaceMigrationBuilderException } from 'src/engine/workspace-manager/workspace-migration/exceptions/workspace-migration-builder-exception';
import { WorkspaceMigrationValidateBuildAndRunService } from 'src/engine/workspace-manager/workspace-migration/services/workspace-migration-validate-build-and-run-service';

const ACCESS_GROUP_RULE_MEMBER_FIELD_VALUES_INDEX_NAME =
  'IDX_95af763d00c158a3cdd0cdf13a4';

@RegisteredWorkspaceCommand('2.61.0', 1795184647512)
@Command({
  name: 'upgrade:2-61:add-access-group-rule-member-field-values-index',
  description:
    'Index access groups by rule and member values so records look up their groups',
})
export class AddAccessGroupRuleMemberFieldValuesIndexCommand extends ProvisionedWorkspaceCommandRunner {
  constructor(
    protected readonly workspaceIteratorService: WorkspaceIteratorService,
    private readonly applicationService: ApplicationService,
    private readonly workspaceCacheService: WorkspaceCacheService,
    private readonly workspaceMigrationValidateBuildAndRunService: WorkspaceMigrationValidateBuildAndRunService,
    @InjectDataSource() private readonly dataSource: DataSource,
  ) {
    super(workspaceIteratorService);
  }

  override async runOnWorkspace({
    workspaceId,
    options,
  }: RunOnWorkspaceArgs): Promise<void> {
    const { flatObjectMetadataMaps, flatIndexMaps } =
      await this.workspaceCacheService.getOrRecompute(workspaceId, [
        'flatObjectMetadataMaps',
        'flatIndexMaps',
      ]);

    if (
      !isDefined(
        flatObjectMetadataMaps.byUniversalIdentifier[
          STANDARD_OBJECTS.accessGroup.universalIdentifier
        ],
      )
    ) {
      await this.addIndexToPermissionTable({
        workspaceId,
        isDryRun: options.dryRun ?? false,
      });

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
    const indexesToCreate =
      getStandardFlatEntitiesToCreateOrThrow<FlatIndexMetadata>({
        standardFlatEntityMaps: standardAllFlatEntityMaps.flatIndexMaps,
        existingFlatEntityMaps: flatIndexMaps,
        universalIdentifiers: [
          STANDARD_OBJECTS.accessGroup.indexes.ruleIdMemberFieldValuesIndex
            .universalIdentifier,
        ],
      });

    if (options.dryRun || indexesToCreate.length === 0) {
      return;
    }

    const result =
      await this.workspaceMigrationValidateBuildAndRunService.validateBuildAndRunLegacyWorkspaceMigration(
        {
          shouldDeferActions: false,
          allFlatEntityOperationByMetadataName: {
            index: {
              flatEntityToCreate: indexesToCreate,
              flatEntityToDelete: [],
              flatEntityToUpdate: [],
            },
          },
          workspaceId,
          isSystemBuild: true,
          applicationUniversalIdentifier:
            twentyStandardFlatApplication.universalIdentifier,
        },
      );

    if (result.status === 'fail') {
      throw new WorkspaceMigrationBuilderException(
        result,
        `Failed to add the access group lookup index for workspace ${workspaceId}`,
      );
    }
  }

  // Workspaces on permission tables hold accessGroup outside the object metadata
  private async addIndexToPermissionTable({
    workspaceId,
    isDryRun,
  }: {
    workspaceId: string;
    isDryRun: boolean;
  }): Promise<void> {
    const schemaName = getWorkspaceSchemaName(workspaceId);
    const [{ isTablePresent }] = await this.dataSource.query(
      `SELECT to_regclass($1) IS NOT NULL AS "isTablePresent"`,
      [`"${schemaName}"."accessGroup"`],
    );

    if (!isTablePresent || isDryRun) {
      return;
    }

    await this.dataSource.query(
      `CREATE INDEX IF NOT EXISTS "${ACCESS_GROUP_RULE_MEMBER_FIELD_VALUES_INDEX_NAME}" ON "${schemaName}"."accessGroup" ("rowLevelPermissionPredicateGroupId", "memberFieldValues")`,
    );
  }
}
