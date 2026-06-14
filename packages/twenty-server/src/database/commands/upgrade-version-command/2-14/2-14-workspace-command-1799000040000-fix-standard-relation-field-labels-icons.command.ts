import { Command } from 'nest-commander';
import {
  DEFAULT_RELATIONS_OBJECTS_STANDARD_IDS,
  STANDARD_OBJECTS,
} from 'twenty-shared/metadata';
import { isDefined } from 'twenty-shared/utils';

import { ActiveOrSuspendedWorkspaceCommandRunner } from 'src/database/commands/command-runners/active-or-suspended-workspace.command-runner';
import { WorkspaceIteratorService } from 'src/database/commands/command-runners/workspace-iterator.service';
import { type RunOnWorkspaceArgs } from 'src/database/commands/command-runners/workspace.command-runner';
import { ApplicationService } from 'src/engine/core-modules/application/application.service';
import { RegisteredWorkspaceCommand } from 'src/engine/core-modules/upgrade/decorators/registered-workspace-command.decorator';
import { WorkspaceCacheService } from 'src/engine/workspace-cache/services/workspace-cache.service';
import { computeTwentyStandardApplicationAllFlatEntityMaps } from 'src/engine/workspace-manager/twenty-standard-application/utils/twenty-standard-application-all-flat-entity-maps.constant';
import { WorkspaceMigrationValidateBuildAndRunService } from 'src/engine/workspace-manager/workspace-migration/services/workspace-migration-validate-build-and-run-service';

// The default relation fields every object gets point to one of the default
// relation objects (note/task/attachment/timeline). On standard objects their
// labels/icons are system-owned, so we re-sync any drift against the
// source-of-truth definition (e.g. the Company timelineActivities
// IconIconTimelineEvent typo). Custom objects are left untouched on purpose:
// their relation fields are user-editable.
const DEFAULT_RELATION_TARGET_UNIVERSAL_IDENTIFIERS = new Set<string>(
  DEFAULT_RELATIONS_OBJECTS_STANDARD_IDS.map(
    (objectName) => STANDARD_OBJECTS[objectName].universalIdentifier,
  ),
);

@RegisteredWorkspaceCommand('2.14.0', 1799000040000)
@Command({
  name: 'upgrade:2-14:fix-standard-relation-field-labels-icons',
  description:
    "Re-sync standard objects' default relation field labels/icons (note/task/attachment/timeline) against the source of truth, healing drift such as the Company timelineActivities IconIconTimelineEvent typo.",
})
export class FixStandardRelationFieldLabelsIconsCommand extends ActiveOrSuspendedWorkspaceCommandRunner {
  constructor(
    protected readonly workspaceIteratorService: WorkspaceIteratorService,
    private readonly applicationService: ApplicationService,
    private readonly workspaceMigrationValidateBuildAndRunService: WorkspaceMigrationValidateBuildAndRunService,
    private readonly workspaceCacheService: WorkspaceCacheService,
  ) {
    super(workspaceIteratorService);
  }

  override async runOnWorkspace({
    workspaceId,
    options,
  }: RunOnWorkspaceArgs): Promise<void> {
    const isDryRun = options.dryRun ?? false;

    const { twentyStandardFlatApplication } =
      await this.applicationService.findWorkspaceTwentyStandardAndCustomApplicationOrThrow(
        { workspaceId },
      );

    const { flatFieldMetadataMaps: existingFlatFieldMetadataMaps } =
      await this.workspaceCacheService.getOrRecompute(workspaceId, [
        'flatFieldMetadataMaps',
      ]);

    const now = new Date().toISOString();

    const { allFlatEntityMaps: standardAllFlatEntityMaps } =
      computeTwentyStandardApplicationAllFlatEntityMaps({
        now,
        workspaceId,
        twentyStandardApplicationId: twentyStandardFlatApplication.id,
      });

    const fieldsToUpdate = Object.values(
      standardAllFlatEntityMaps.flatFieldMetadataMaps.byUniversalIdentifier,
    )
      .filter(isDefined)
      .filter(
        (standardField) =>
          isDefined(
            standardField.relationTargetObjectMetadataUniversalIdentifier,
          ) &&
          DEFAULT_RELATION_TARGET_UNIVERSAL_IDENTIFIERS.has(
            standardField.relationTargetObjectMetadataUniversalIdentifier,
          ),
      )
      .map((standardField) => {
        const existingField =
          existingFlatFieldMetadataMaps.byUniversalIdentifier[
            standardField.universalIdentifier
          ];

        if (
          !isDefined(existingField) ||
          (existingField.label === standardField.label &&
            existingField.icon === standardField.icon)
        ) {
          return undefined;
        }

        return {
          ...existingField,
          label: standardField.label,
          icon: standardField.icon,
          updatedAt: now,
        };
      })
      .filter(isDefined);

    if (fieldsToUpdate.length === 0) {
      this.logger.log(
        `Standard relation field labels/icons already up to date for workspace ${workspaceId}`,
      );

      return;
    }

    this.logger.log(
      `${isDryRun ? '[DRY RUN] ' : ''}Workspace ${workspaceId}: ${fieldsToUpdate.length} standard relation field(s) to heal`,
    );

    if (isDryRun) {
      return;
    }

    const result =
      await this.workspaceMigrationValidateBuildAndRunService.validateBuildAndRunWorkspaceMigration(
        {
          allFlatEntityOperationByMetadataName: {
            fieldMetadata: {
              flatEntityToCreate: [],
              flatEntityToDelete: [],
              flatEntityToUpdate: fieldsToUpdate,
            },
          },
          workspaceId,
          applicationUniversalIdentifier:
            twentyStandardFlatApplication.universalIdentifier,
        },
      );

    if (result.status === 'fail') {
      throw new Error(
        `Migration failed for workspace ${workspaceId} while healing standard relation field labels/icons`,
      );
    }

    this.logger.log(
      `Healed ${fieldsToUpdate.length} standard relation field(s) for workspace ${workspaceId}`,
    );
  }
}
