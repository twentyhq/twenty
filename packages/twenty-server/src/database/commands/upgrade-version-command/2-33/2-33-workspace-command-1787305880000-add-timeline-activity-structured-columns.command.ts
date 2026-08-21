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
import { WorkspaceCacheService } from 'src/engine/workspace-cache/services/workspace-cache.service';
import { computeTwentyStandardApplicationAllFlatEntityMaps } from 'src/engine/workspace-manager/twenty-standard-application/utils/twenty-standard-application-all-flat-entity-maps.constant';
import { WorkspaceMigrationValidateBuildAndRunService } from 'src/engine/workspace-manager/workspace-migration/services/workspace-migration-validate-build-and-run-service';

const TIMELINE_ACTIVITY = STANDARD_OBJECTS.timelineActivity;
const NEW_FIELD_UNIVERSAL_IDENTIFIERS = [
  TIMELINE_ACTIVITY.fields.action.universalIdentifier,
  TIMELINE_ACTIVITY.fields.sourceObjectMetadataId.universalIdentifier,
  TIMELINE_ACTIVITY.fields.ruleRelationFieldMetadataId.universalIdentifier,
];

@RegisteredWorkspaceCommand('2.33.0', 1787305880000)
@Command({
  name: 'upgrade:2-33:add-timeline-activity-structured-columns',
  description:
    'Add the timelineActivity.action, timelineActivity.sourceObjectMetadataId and timelineActivity.ruleRelationFieldMetadataId system fields on existing workspaces that predate them',
})
export class AddTimelineActivityStructuredColumnsCommand extends ProvisionedWorkspaceCommandRunner {
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
  }: RunOnWorkspaceArgs): Promise<void> {
    const isDryRun = options.dryRun ?? false;

    const { flatFieldMetadataMaps, flatObjectMetadataMaps } =
      await this.workspaceCacheService.getOrRecompute(workspaceId, [
        'flatFieldMetadataMaps',
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

    const missingFieldUniversalIdentifiers =
      NEW_FIELD_UNIVERSAL_IDENTIFIERS.filter(
        (universalIdentifier) =>
          !isDefined(
            flatFieldMetadataMaps.byUniversalIdentifier[universalIdentifier],
          ),
      );

    if (missingFieldUniversalIdentifiers.length === 0) {
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

    const flatFieldMetadatasToCreate = missingFieldUniversalIdentifiers.map(
      (universalIdentifier) => {
        const standardField =
          findFlatEntityByUniversalIdentifier<FlatFieldMetadata>({
            flatEntityMaps: standardAllFlatEntityMaps.flatFieldMetadataMaps,
            universalIdentifier,
          });

        if (!isDefined(standardField)) {
          throw new Error(
            `Standard application is missing timelineActivity field ${universalIdentifier}`,
          );
        }

        return {
          ...standardField,
          viewFieldIds: [],
          viewFieldUniversalIdentifiers: [],
        };
      },
    );

    if (isDryRun) {
      this.logger.log(
        `[DRY RUN] Would add ${flatFieldMetadatasToCreate.length} timelineActivity fields for workspace ${workspaceId}`,
      );

      return;
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
              flatEntityToCreate: flatFieldMetadatasToCreate,
              flatEntityToDelete: [],
              flatEntityToUpdate: [],
            },
          },
        },
      );

    if (result.status === 'fail') {
      this.logger.error(
        `Failed to add timelineActivity structured columns:\n${JSON.stringify(result, null, 2)}`,
      );

      throw new Error(
        `Failed to add timelineActivity structured columns for workspace ${workspaceId}`,
      );
    }

    this.logger.log(
      `Added timelineActivity structured columns for workspace ${workspaceId}`,
    );
  }
}
