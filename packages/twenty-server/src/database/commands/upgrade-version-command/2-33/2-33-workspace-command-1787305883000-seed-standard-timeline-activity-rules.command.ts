import { Command } from 'nest-commander';

import { getTimelineActivityRuleUniversalIdentifier } from 'twenty-shared/application';
import { isDefined } from 'twenty-shared/utils';
import { v4 } from 'uuid';

import { ProvisionedWorkspaceCommandRunner } from 'src/database/commands/command-runners/provisioned-workspace.command-runner';
import { WorkspaceIteratorService } from 'src/database/commands/command-runners/workspace-iterator.service';
import { type RunOnWorkspaceArgs } from 'src/database/commands/command-runners/workspace.command-runner';
import { ApplicationService } from 'src/engine/core-modules/application/application.service';
import { RegisteredWorkspaceCommand } from 'src/engine/core-modules/upgrade/decorators/registered-workspace-command.decorator';
import { type FlatTimelineActivityRule } from 'src/engine/metadata-modules/flat-timeline-activity-rule/types/flat-timeline-activity-rule.type';
import { WorkspaceCacheService } from 'src/engine/workspace-cache/services/workspace-cache.service';
import { STANDARD_TIMELINE_ACTIVITY_RULES } from 'src/engine/workspace-manager/twenty-standard-application/constants/standard-timeline-activity-rules.constant';
import { WorkspaceMigrationValidateBuildAndRunService } from 'src/engine/workspace-manager/workspace-migration/services/workspace-migration-validate-build-and-run-service';

@RegisteredWorkspaceCommand('2.33.0', 1787305883000)
@Command({
  name: 'upgrade:2-33:seed-standard-timeline-activity-rules',
  description:
    'Create the standard note and task timeline activity rules on existing workspaces',
})
export class SeedStandardTimelineActivityRulesCommand extends ProvisionedWorkspaceCommandRunner {
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

    const {
      flatTimelineActivityRuleMaps,
      flatObjectMetadataMaps,
      flatFieldMetadataMaps,
    } = await this.workspaceCacheService.getOrRecompute(workspaceId, [
      'flatTimelineActivityRuleMaps',
      'flatObjectMetadataMaps',
      'flatFieldMetadataMaps',
    ]);

    const now = new Date().toISOString();
    const flatTimelineActivityRulesToCreate: FlatTimelineActivityRule[] = [];

    for (const standardRule of STANDARD_TIMELINE_ACTIVITY_RULES) {
      const {
        objectName,
        relationFieldName,
        actions,
        objectUniversalIdentifier,
        relationFieldUniversalIdentifier,
        triggerFieldUniversalIdentifiers,
      } = standardRule;

      const flatObjectMetadata =
        flatObjectMetadataMaps.byUniversalIdentifier[objectUniversalIdentifier];
      const relationFlatFieldMetadata =
        flatFieldMetadataMaps.byUniversalIdentifier[
          relationFieldUniversalIdentifier
        ];

      if (
        !isDefined(flatObjectMetadata) ||
        !isDefined(relationFlatFieldMetadata)
      ) {
        this.logger.log(
          `${objectName}.${relationFieldName} does not exist for workspace ${workspaceId}, skipping the rule`,
        );
        continue;
      }

      const universalIdentifier = getTimelineActivityRuleUniversalIdentifier({
        applicationUniversalIdentifier:
          twentyStandardFlatApplication.universalIdentifier,
        objectMetadataUniversalIdentifier: objectUniversalIdentifier,
        relationFieldMetadataUniversalIdentifier:
          relationFieldUniversalIdentifier,
      });

      if (
        isDefined(
          flatTimelineActivityRuleMaps.byUniversalIdentifier[
            universalIdentifier
          ],
        )
      ) {
        continue;
      }

      const triggerFieldMetadataIds = triggerFieldUniversalIdentifiers
        .map(
          (triggerFieldUniversalIdentifier) =>
            flatFieldMetadataMaps.byUniversalIdentifier[
              triggerFieldUniversalIdentifier
            ]?.id,
        )
        .filter(isDefined);

      flatTimelineActivityRulesToCreate.push({
        id: v4(),
        universalIdentifier,
        applicationId: twentyStandardFlatApplication.id,
        applicationUniversalIdentifier:
          twentyStandardFlatApplication.universalIdentifier,
        objectMetadataId: flatObjectMetadata.id,
        objectMetadataUniversalIdentifier: objectUniversalIdentifier,
        relationFieldMetadataId: relationFlatFieldMetadata.id,
        relationFieldMetadataUniversalIdentifier:
          relationFieldUniversalIdentifier,
        resolution: 'MATERIALIZED',
        actions: [...actions],
        triggerFieldMetadataIds,
        isActive: true,
        workspaceId,
        createdAt: now,
        updatedAt: now,
      });
    }

    if (flatTimelineActivityRulesToCreate.length === 0) {
      this.logger.log(
        `Standard timeline activity rules already exist for workspace ${workspaceId}, skipping`,
      );

      return;
    }

    this.logger.log(
      `${isDryRun ? '[DRY RUN] ' : ''}Creating ${flatTimelineActivityRulesToCreate.length} standard timeline activity rule(s) for workspace ${workspaceId}`,
    );

    if (isDryRun) {
      return;
    }

    const validateAndBuildResult =
      await this.workspaceMigrationValidateBuildAndRunService.validateBuildAndRunLegacyWorkspaceMigration(
        {
          isSystemBuild: true,
          allFlatEntityOperationByMetadataName: {
            timelineActivityRule: {
              flatEntityToCreate: flatTimelineActivityRulesToCreate,
              flatEntityToDelete: [],
              flatEntityToUpdate: [],
            },
          },
          workspaceId,
          applicationUniversalIdentifier:
            twentyStandardFlatApplication.universalIdentifier,
        },
      );

    if (validateAndBuildResult.status === 'fail') {
      throw new Error(
        `Failed to create standard timeline activity rules for workspace ${workspaceId}: ${JSON.stringify(
          validateAndBuildResult,
          null,
          2,
        )}`,
      );
    }

    this.logger.log(
      `Created standard timeline activity rules for workspace ${workspaceId}`,
    );
  }
}
