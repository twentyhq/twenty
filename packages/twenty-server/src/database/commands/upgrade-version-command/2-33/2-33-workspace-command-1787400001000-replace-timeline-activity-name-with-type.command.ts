import { Command } from 'nest-commander';
import { STANDARD_OBJECTS } from 'twenty-shared/metadata';
import { isDefined } from 'twenty-shared/utils';

import { ProvisionedWorkspaceCommandRunner } from 'src/database/commands/command-runners/provisioned-workspace.command-runner';
import { WorkspaceIteratorService } from 'src/database/commands/command-runners/workspace-iterator.service';
import { type RunOnWorkspaceArgs } from 'src/database/commands/command-runners/workspace.command-runner';
import { ApplicationService } from 'src/engine/core-modules/application/application.service';
import { RegisteredWorkspaceCommand } from 'src/engine/core-modules/upgrade/decorators/registered-workspace-command.decorator';
import { findFlatEntityByUniversalIdentifier } from 'src/engine/metadata-modules/flat-entity/utils/find-flat-entity-by-universal-identifier.util';
import { type FlatFieldMetadata } from 'src/engine/metadata-modules/flat-field-metadata/types/flat-field-metadata.type';
import { type FlatObjectMetadata } from 'src/engine/metadata-modules/flat-object-metadata/types/flat-object-metadata.type';
import { type FlatTimelineActivityType } from 'src/engine/metadata-modules/flat-timeline-activity-type/types/flat-timeline-activity-type.type';
import { getWorkspaceSchemaName } from 'src/engine/workspace-datasource/utils/get-workspace-schema-name.util';
import { WorkspaceCacheService } from 'src/engine/workspace-cache/services/workspace-cache.service';
import { computeTwentyStandardApplicationAllFlatEntityMaps } from 'src/engine/workspace-manager/twenty-standard-application/utils/twenty-standard-application-all-flat-entity-maps.constant';
import { WorkspaceMigrationValidateBuildAndRunService } from 'src/engine/workspace-manager/workspace-migration/services/workspace-migration-validate-build-and-run-service';
import { buildTimelineActivityTypeBackfillQuery } from 'src/database/commands/upgrade-version-command/2-33/utils/build-timeline-activity-type-backfill-query.util';

const TIMELINE_ACTIVITY = STANDARD_OBJECTS.timelineActivity;
const LEGACY_NAME_FIELD_UNIVERSAL_IDENTIFIER =
  '20202020-7207-46e8-9dab-849505ae8497';

@RegisteredWorkspaceCommand('2.33.0', 1787400001000)
@Command({
  name: 'upgrade:2-33:replace-timeline-activity-name-with-type',
  description:
    'Seed the standard timelineActivityType rows, add timelineActivity.timelineActivityTypeId, backfill it from the legacy name column and drop that column',
})
export class ReplaceTimelineActivityNameWithTypeCommand extends ProvisionedWorkspaceCommandRunner {
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

    const { flatObjectMetadataMaps } =
      await this.workspaceCacheService.getOrRecompute(workspaceId, [
        'flatObjectMetadataMaps',
      ]);

    const timelineActivityObjectMetadata =
      findFlatEntityByUniversalIdentifier<FlatObjectMetadata>({
        flatEntityMaps: flatObjectMetadataMaps,
        universalIdentifier: TIMELINE_ACTIVITY.universalIdentifier,
      });

    if (!isDefined(timelineActivityObjectMetadata)) {
      this.logger.log(
        `timelineActivity object does not exist for workspace ${workspaceId}, skipping`,
      );

      return;
    }

    if (!isDefined(dataSource)) {
      this.logger.log(`No data source for workspace ${workspaceId}, skipping`);

      return;
    }

    if (isDryRun) {
      this.logger.log(
        `[DRY RUN] Would replace timelineActivity.name with timelineActivityTypeId for workspace ${workspaceId}`,
      );

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

    await this.createTypesAndField({
      workspaceId,
      applicationUniversalIdentifier:
        twentyStandardFlatApplication.universalIdentifier,
      standardAllFlatEntityMaps,
    });

    await this.backfillTimelineActivityTypeIds({ workspaceId, dataSource });

    await this.deleteLegacyNameField({
      workspaceId,
      applicationUniversalIdentifier:
        twentyStandardFlatApplication.universalIdentifier,
    });

    this.logger.log(
      `Replaced timelineActivity.name with timelineActivityTypeId for workspace ${workspaceId}`,
    );
  }

  private async createTypesAndField({
    workspaceId,
    applicationUniversalIdentifier,
    standardAllFlatEntityMaps,
  }: {
    workspaceId: string;
    applicationUniversalIdentifier: string;
    standardAllFlatEntityMaps: ReturnType<
      typeof computeTwentyStandardApplicationAllFlatEntityMaps
    >['allFlatEntityMaps'];
  }): Promise<void> {
    const { flatFieldMetadataMaps, flatTimelineActivityTypeMaps } =
      await this.workspaceCacheService.getOrRecompute(workspaceId, [
        'flatFieldMetadataMaps',
        'flatTimelineActivityTypeMaps',
      ]);

    const flatTimelineActivityTypesToCreate = Object.values(
      standardAllFlatEntityMaps.flatTimelineActivityTypeMaps
        .byUniversalIdentifier,
    )
      .filter(isDefined)
      .filter(
        (flatTimelineActivityType: FlatTimelineActivityType) =>
          !isDefined(
            flatTimelineActivityTypeMaps.byUniversalIdentifier[
              flatTimelineActivityType.universalIdentifier
            ],
          ),
      );

    const standardTypeField =
      findFlatEntityByUniversalIdentifier<FlatFieldMetadata>({
        flatEntityMaps: standardAllFlatEntityMaps.flatFieldMetadataMaps,
        universalIdentifier:
          TIMELINE_ACTIVITY.fields.timelineActivityTypeId.universalIdentifier,
      });

    if (!isDefined(standardTypeField)) {
      throw new Error(
        'Standard application is missing timelineActivity.timelineActivityTypeId',
      );
    }

    const flatFieldMetadatasToCreate = isDefined(
      flatFieldMetadataMaps.byUniversalIdentifier[
        standardTypeField.universalIdentifier
      ],
    )
      ? []
      : [
          {
            ...standardTypeField,
            viewFieldIds: [],
            viewFieldUniversalIdentifiers: [],
          },
        ];

    if (
      flatTimelineActivityTypesToCreate.length === 0 &&
      flatFieldMetadatasToCreate.length === 0
    ) {
      return;
    }

    const result =
      await this.workspaceMigrationValidateBuildAndRunService.validateBuildAndRunLegacyWorkspaceMigration(
        {
          isSystemBuild: true,
          workspaceId,
          applicationUniversalIdentifier,
          allFlatEntityOperationByMetadataName: {
            timelineActivityType: {
              flatEntityToCreate: flatTimelineActivityTypesToCreate,
              flatEntityToDelete: [],
              flatEntityToUpdate: [],
            },
            fieldMetadata: {
              flatEntityToCreate: flatFieldMetadatasToCreate,
              flatEntityToDelete: [],
              flatEntityToUpdate: [],
            },
          },
        },
      );

    if (result.status === 'fail') {
      throw new Error(
        `Failed to create timeline activity types for workspace ${workspaceId}:\n${JSON.stringify(result, null, 2)}`,
      );
    }
  }

  private async backfillTimelineActivityTypeIds({
    workspaceId,
    dataSource,
  }: {
    workspaceId: string;
    dataSource: NonNullable<RunOnWorkspaceArgs['dataSource']>;
  }): Promise<void> {
    const { flatTimelineActivityTypeMaps } =
      await this.workspaceCacheService.getOrRecompute(workspaceId, [
        'flatTimelineActivityTypeMaps',
      ]);

    const backfillQuery = buildTimelineActivityTypeBackfillQuery({
      schemaName: getWorkspaceSchemaName(workspaceId),
      flatTimelineActivityTypeMaps,
    });

    if (!isDefined(backfillQuery)) {
      throw new Error(
        `Workspace ${workspaceId} is missing standard timeline activity types after seeding`,
      );
    }

    const result = await dataSource.query(
      backfillQuery.sql,
      backfillQuery.parameters,
      undefined,
      { shouldBypassPermissionChecks: true },
    );

    this.logger.log(
      `Backfilled ${result?.[1] ?? 0} timelineActivity rows for workspace ${workspaceId}`,
    );
  }

  private async deleteLegacyNameField({
    workspaceId,
    applicationUniversalIdentifier,
  }: {
    workspaceId: string;
    applicationUniversalIdentifier: string;
  }): Promise<void> {
    const { flatFieldMetadataMaps } =
      await this.workspaceCacheService.getOrRecompute(workspaceId, [
        'flatFieldMetadataMaps',
      ]);

    const legacyNameField =
      flatFieldMetadataMaps.byUniversalIdentifier[
        LEGACY_NAME_FIELD_UNIVERSAL_IDENTIFIER
      ];

    if (!isDefined(legacyNameField)) {
      return;
    }

    const result =
      await this.workspaceMigrationValidateBuildAndRunService.validateBuildAndRunLegacyWorkspaceMigration(
        {
          isSystemBuild: true,
          workspaceId,
          applicationUniversalIdentifier,
          allFlatEntityOperationByMetadataName: {
            fieldMetadata: {
              flatEntityToCreate: [],
              flatEntityToDelete: [legacyNameField],
              flatEntityToUpdate: [],
            },
          },
        },
      );

    if (result.status === 'fail') {
      throw new Error(
        `Failed to drop timelineActivity.name for workspace ${workspaceId}:\n${JSON.stringify(result, null, 2)}`,
      );
    }
  }
}
