import { Command } from 'nest-commander';
import { STANDARD_OBJECTS } from 'twenty-shared/metadata';
import { isDefined } from 'twenty-shared/utils';

import { ProvisionedWorkspaceCommandRunner } from 'src/database/commands/command-runners/provisioned-workspace.command-runner';
import { WorkspaceIteratorService } from 'src/database/commands/command-runners/workspace-iterator.service';
import { type RunOnWorkspaceArgs } from 'src/database/commands/command-runners/workspace.command-runner';
import { getStandardFlatEntitiesToCreateOrThrow } from 'src/database/commands/upgrade-version-command/2-10/utils/get-standard-flat-entities-to-create-or-throw.util';
import { ApplicationService } from 'src/engine/core-modules/application/application.service';
import { RegisteredWorkspaceCommand } from 'src/engine/core-modules/upgrade/decorators/registered-workspace-command.decorator';
import { findFlatEntityByUniversalIdentifier } from 'src/engine/metadata-modules/flat-entity/utils/find-flat-entity-by-universal-identifier.util';
import { type FlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/types/flat-entity-maps.type';
import { type FlatFieldMetadata } from 'src/engine/metadata-modules/flat-field-metadata/types/flat-field-metadata.type';
import { type FlatObjectMetadata } from 'src/engine/metadata-modules/flat-object-metadata/types/flat-object-metadata.type';
import { type GlobalWorkspaceDataSource } from 'src/engine/twenty-orm/global-workspace-datasource/global-workspace-datasource';
import { getWorkspaceSchemaName } from 'src/engine/workspace-datasource/utils/get-workspace-schema-name.util';
import { WorkspaceCacheService } from 'src/engine/workspace-cache/services/workspace-cache.service';
import { computeTwentyStandardApplicationAllFlatEntityMaps } from 'src/engine/workspace-manager/twenty-standard-application/utils/twenty-standard-application-all-flat-entity-maps.constant';
import { WorkspaceMigrationValidateBuildAndRunService } from 'src/engine/workspace-manager/workspace-migration/services/workspace-migration-validate-build-and-run-service';
import { OPEN_TASK_STATUSES } from 'src/modules/person/constants/open-task-statuses.constant';

const OPEN_TASK_COUNT_UNIVERSAL_IDENTIFIER =
  STANDARD_OBJECTS.person.fields.openTaskCount.universalIdentifier;

type FieldProvisioningOutcome = 'created' | 'already-exists' | 'would-create';

@RegisteredWorkspaceCommand('2.25.0', 1785700000000)
@Command({
  name: 'upgrade:2-25:provision-and-backfill-person-open-task-count',
  description:
    'Add the Person openTaskCount field and backfill it from existing task targets',
})
export class ProvisionAndBackfillPersonOpenTaskCountCommand extends ProvisionedWorkspaceCommandRunner {
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
    options,
    dataSource,
  }: RunOnWorkspaceArgs): Promise<void> {
    const isDryRun = options.dryRun ?? false;

    if (!isDefined(dataSource)) {
      this.logger.log(
        `No workspace data source for workspace ${workspaceId}, skipping`,
      );

      return;
    }

    const { flatFieldMetadataMaps, flatObjectMetadataMaps } =
      await this.workspaceCacheService.getOrRecompute(workspaceId, [
        'flatFieldMetadataMaps',
        'flatObjectMetadataMaps',
      ]);

    const hasPersonObject = isDefined(
      findFlatEntityByUniversalIdentifier<FlatObjectMetadata>({
        flatEntityMaps: flatObjectMetadataMaps,
        universalIdentifier: STANDARD_OBJECTS.person.universalIdentifier,
      }),
    );

    if (!hasPersonObject) {
      this.logger.log(
        `person object not found for workspace ${workspaceId}, skipping`,
      );

      return;
    }

    const provisioningOutcome = await this.provisionOpenTaskCountField({
      workspaceId,
      flatFieldMetadataMaps,
      isDryRun,
    });

    // There is no column to read or write yet, so a dry run that would have
    // created it cannot report backfill numbers.
    if (provisioningOutcome === 'would-create') {
      this.logger.log(
        `[DRY RUN] Would backfill openTaskCount for workspace ${workspaceId} once the field exists`,
      );

      return;
    }

    await this.backfillOpenTaskCounts({ workspaceId, dataSource, isDryRun });
  }

  private async provisionOpenTaskCountField({
    workspaceId,
    flatFieldMetadataMaps,
    isDryRun,
  }: {
    workspaceId: string;
    flatFieldMetadataMaps: FlatEntityMaps<FlatFieldMetadata>;
    isDryRun: boolean;
  }): Promise<FieldProvisioningOutcome> {
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

    const flatEntityToCreate =
      getStandardFlatEntitiesToCreateOrThrow<FlatFieldMetadata>({
        existingFlatEntityMaps: flatFieldMetadataMaps,
        standardFlatEntityMaps: standardAllFlatEntityMaps.flatFieldMetadataMaps,
        universalIdentifiers: [OPEN_TASK_COUNT_UNIVERSAL_IDENTIFIER],
      });

    if (flatEntityToCreate.length === 0) {
      this.logger.log(
        `openTaskCount field already exists for workspace ${workspaceId}`,
      );

      return 'already-exists';
    }

    if (isDryRun) {
      this.logger.log(
        `[DRY RUN] Would create the openTaskCount field for workspace ${workspaceId}`,
      );

      return 'would-create';
    }

    const result =
      await this.workspaceMigrationValidateBuildAndRunService.validateBuildAndRunWorkspaceMigration(
        {
          isSystemBuild: true,
          applicationUniversalIdentifier:
            twentyStandardFlatApplication.universalIdentifier,
          workspaceId,
          allFlatEntityOperationByMetadataName: {
            fieldMetadata: {
              flatEntityToCreate,
              flatEntityToDelete: [],
              flatEntityToUpdate: [],
            },
          },
        },
      );

    if (result.status === 'fail') {
      throw new Error(
        `Failed to provision the openTaskCount field for workspace ${workspaceId}: ${JSON.stringify(
          result,
          null,
          2,
        )}`,
      );
    }

    this.logger.log(
      `Provisioned the openTaskCount field for workspace ${workspaceId}`,
    );

    return 'created';
  }

  // Deliberately raw SQL: the field is created in this same process, so the ORM
  // entity schema still predates the new column. It also keeps the backfill to
  // one set-based statement instead of paging every person through the app.
  private async backfillOpenTaskCounts({
    workspaceId,
    dataSource,
    isDryRun,
  }: {
    workspaceId: string;
    dataSource: GlobalWorkspaceDataSource;
    isDryRun: boolean;
  }): Promise<void> {
    const schemaName = getWorkspaceSchemaName(workspaceId);

    const staleCountsSource = `
      FROM "${schemaName}"."person" "existingPerson"
      LEFT JOIN (
        SELECT "taskTarget"."targetPersonId" AS "personId",
               COUNT(DISTINCT "taskTarget"."taskId") AS "openTaskCount"
        FROM "${schemaName}"."taskTarget" "taskTarget"
        JOIN "${schemaName}"."task" "task"
          ON "task"."id" = "taskTarget"."taskId"
        WHERE "taskTarget"."deletedAt" IS NULL
          AND "task"."deletedAt" IS NULL
          AND "task"."status"::text = ANY($1)
        GROUP BY "taskTarget"."targetPersonId"
      ) "computed" ON "computed"."personId" = "existingPerson"."id"
      WHERE "existingPerson"."openTaskCount"
        IS DISTINCT FROM COALESCE("computed"."openTaskCount", 0)
    `;

    const queryRunner = dataSource.createQueryRunner();

    try {
      await queryRunner.connect();

      // Counted up front rather than from the UPDATE result: TypeORM hands back
      // a [rows, rowCount] tuple here, which silently reports as a length of 2.
      const [{ count: staleCount }]: { count: string }[] =
        await queryRunner.query(
          `SELECT COUNT(*) AS count ${staleCountsSource}`,
          [OPEN_TASK_STATUSES],
        );

      if (isDryRun) {
        this.logger.log(
          `[DRY RUN] Would update ${staleCount} openTaskCount values for workspace ${workspaceId}`,
        );

        return;
      }

      await queryRunner.query(
        `UPDATE "${schemaName}"."person" "personToUpdate"
         SET "openTaskCount" = COALESCE("computed"."openTaskCount", 0)
         FROM "${schemaName}"."person" "existingPerson"
         LEFT JOIN (
           SELECT "taskTarget"."targetPersonId" AS "personId",
                  COUNT(DISTINCT "taskTarget"."taskId") AS "openTaskCount"
           FROM "${schemaName}"."taskTarget" "taskTarget"
           JOIN "${schemaName}"."task" "task"
             ON "task"."id" = "taskTarget"."taskId"
           WHERE "taskTarget"."deletedAt" IS NULL
             AND "task"."deletedAt" IS NULL
             AND "task"."status"::text = ANY($1)
           GROUP BY "taskTarget"."targetPersonId"
         ) "computed" ON "computed"."personId" = "existingPerson"."id"
         WHERE "personToUpdate"."id" = "existingPerson"."id"
           AND "existingPerson"."openTaskCount"
             IS DISTINCT FROM COALESCE("computed"."openTaskCount", 0)`,
        [OPEN_TASK_STATUSES],
      );

      this.logger.log(
        `Updated ${staleCount} openTaskCount values for workspace ${workspaceId}`,
      );
    } finally {
      await queryRunner.release();
    }
  }
}
