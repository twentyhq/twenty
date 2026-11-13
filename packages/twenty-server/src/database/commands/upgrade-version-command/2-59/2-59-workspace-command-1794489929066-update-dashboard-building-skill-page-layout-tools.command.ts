import { Command } from 'nest-commander';
import { TWENTY_STANDARD_APPLICATION_UNIVERSAL_IDENTIFIER } from 'twenty-shared/application';
import { isDefined } from 'twenty-shared/utils';

import { ProvisionedWorkspaceCommandRunner } from 'src/database/commands/command-runners/provisioned-workspace.command-runner';
import { WorkspaceIteratorService } from 'src/database/commands/command-runners/workspace-iterator.service';
import { type RunOnWorkspaceArgs } from 'src/database/commands/command-runners/workspace.command-runner';
import { ApplicationService } from 'src/engine/core-modules/application/application.service';
import { RegisteredWorkspaceCommand } from 'src/engine/core-modules/upgrade/decorators/registered-workspace-command.decorator';
import {
  SkillException,
  SkillExceptionCode,
} from 'src/engine/metadata-modules/skill/skill.exception';
import { WorkspaceCacheService } from 'src/engine/workspace-cache/services/workspace-cache.service';
import { STANDARD_SKILL } from 'src/engine/workspace-manager/twenty-standard-application/constants/standard-skill.constant';
import { computeTwentyStandardApplicationAllFlatEntityMaps } from 'src/engine/workspace-manager/twenty-standard-application/utils/twenty-standard-application-all-flat-entity-maps.constant';
import { WorkspaceMigrationBuilderException } from 'src/engine/workspace-manager/workspace-migration/exceptions/workspace-migration-builder-exception';
import { WorkspaceMigrationValidateBuildAndRunService } from 'src/engine/workspace-manager/workspace-migration/services/workspace-migration-validate-build-and-run-service';

const DASHBOARD_BUILDING_SKILL_UNIVERSAL_IDENTIFIER =
  STANDARD_SKILL['dashboard-building'].universalIdentifier;

@RegisteredWorkspaceCommand('2.59.0', 1794489929066)
@Command({
  name: 'upgrade:2-59:update-dashboard-building-skill-page-layout-tools',
  description:
    'Update the standard dashboard-building skill to use page-layout tools',
})
export class UpdateDashboardBuildingSkillPageLayoutToolsCommand extends ProvisionedWorkspaceCommandRunner {
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
    const { twentyStandardFlatApplication } =
      await this.applicationService.findWorkspaceTwentyStandardAndCustomApplicationOrThrow(
        { workspaceId },
      );

    const { flatSkillMaps } = await this.workspaceCacheService.getOrRecompute(
      workspaceId,
      ['flatSkillMaps'],
    );

    const { allFlatEntityMaps: standardAllFlatEntityMaps } =
      computeTwentyStandardApplicationAllFlatEntityMaps({
        now: new Date().toISOString(),
        workspaceId,
        twentyStandardApplicationId: twentyStandardFlatApplication.id,
      });

    const standardContent =
      standardAllFlatEntityMaps.flatSkillMaps.byUniversalIdentifier[
        DASHBOARD_BUILDING_SKILL_UNIVERSAL_IDENTIFIER
      ]?.content;

    if (!isDefined(standardContent)) {
      throw new SkillException(
        'The dashboard-building skill is missing from the standard application definition',
        SkillExceptionCode.SKILL_NOT_FOUND,
      );
    }

    const existingSkill =
      flatSkillMaps.byUniversalIdentifier[
        DASHBOARD_BUILDING_SKILL_UNIVERSAL_IDENTIFIER
      ];

    if (
      !isDefined(existingSkill) ||
      existingSkill.content === standardContent
    ) {
      return;
    }

    const skillToUpdate = { ...existingSkill, content: standardContent };

    this.logger.log(
      `${options.dryRun ? '[DRY RUN] ' : ''}Workspace ${workspaceId}: updating the dashboard-building skill content`,
    );

    if (options.dryRun) {
      return;
    }

    const result =
      await this.workspaceMigrationValidateBuildAndRunService.validateBuildAndRunLegacyWorkspaceMigration(
        {
          shouldDeferActions: false,
          workspaceId,
          isSystemBuild: true,
          applicationUniversalIdentifier:
            TWENTY_STANDARD_APPLICATION_UNIVERSAL_IDENTIFIER,
          allFlatEntityOperationByMetadataName: {
            skill: {
              flatEntityToCreate: [],
              flatEntityToDelete: [],
              flatEntityToUpdate: [skillToUpdate],
            },
          },
        },
      );

    if (result.status === 'fail') {
      throw new WorkspaceMigrationBuilderException(
        result,
        `Failed to update the dashboard-building skill for workspace ${workspaceId}`,
      );
    }
  }
}
