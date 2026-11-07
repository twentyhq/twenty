import { Command } from 'nest-commander';
import { TWENTY_STANDARD_APPLICATION_UNIVERSAL_IDENTIFIER } from 'twenty-shared/application';
import { isDefined } from 'twenty-shared/utils';

import { ProvisionedWorkspaceCommandRunner } from 'src/database/commands/command-runners/provisioned-workspace.command-runner';
import { WorkspaceIteratorService } from 'src/database/commands/command-runners/workspace-iterator.service';
import { type RunOnWorkspaceArgs } from 'src/database/commands/command-runners/workspace.command-runner';
import { CRM_HYGIENE_SKILL_CONTENT_BEFORE_MERGE_TOOL } from 'src/database/commands/upgrade-version-command/2-54/constants/crm-hygiene-skill-content-before-merge-tool.constant';
import { buildSkillContentReplacement } from 'src/database/commands/upgrade-version-command/2-54/utils/build-skill-content-replacement.util';
import { ApplicationService } from 'src/engine/core-modules/application/application.service';
import { RegisteredWorkspaceCommand } from 'src/engine/core-modules/upgrade/decorators/registered-workspace-command.decorator';
import { WorkspaceCacheService } from 'src/engine/workspace-cache/services/workspace-cache.service';
import { STANDARD_SKILL } from 'src/engine/workspace-manager/twenty-standard-application/constants/standard-skill.constant';
import { computeTwentyStandardApplicationAllFlatEntityMaps } from 'src/engine/workspace-manager/twenty-standard-application/utils/twenty-standard-application-all-flat-entity-maps.constant';
import { WorkspaceMigrationBuilderException } from 'src/engine/workspace-manager/workspace-migration/exceptions/workspace-migration-builder-exception';
import { WorkspaceMigrationValidateBuildAndRunService } from 'src/engine/workspace-manager/workspace-migration/services/workspace-migration-validate-build-and-run-service';

const CRM_HYGIENE_SKILL_UNIVERSAL_IDENTIFIER =
  STANDARD_SKILL['crm-hygiene'].universalIdentifier;

@RegisteredWorkspaceCommand('2.54.0', 1793206127866)
@Command({
  name: 'upgrade:2-54:update-crm-hygiene-skill-merge-guidance',
  description:
    'Update the crm-hygiene skill so it merges duplicates with merge_many_* instead of saying there is no merge tool',
})
export class UpdateCrmHygieneSkillMergeGuidanceCommand extends ProvisionedWorkspaceCommandRunner {
  constructor(
    protected readonly workspaceIteratorService: WorkspaceIteratorService,
    private readonly applicationService: ApplicationService,
    private readonly workspaceCacheService: WorkspaceCacheService,
    private readonly workspaceMigrationValidateBuildAndRunService: WorkspaceMigrationValidateBuildAndRunService,
  ) {
    super(workspaceIteratorService);
  }

  override async runOnWorkspace(args: RunOnWorkspaceArgs): Promise<void> {
    await this.up(args);
  }

  async up(args: RunOnWorkspaceArgs): Promise<void> {
    await this.apply(args, 'up');
  }

  async down(args: RunOnWorkspaceArgs): Promise<void> {
    await this.apply(args, 'down');
  }

  private async apply(
    { workspaceId, options }: RunOnWorkspaceArgs,
    direction: 'up' | 'down',
  ): Promise<void> {
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
        CRM_HYGIENE_SKILL_UNIVERSAL_IDENTIFIER
      ]?.content;

    if (!isDefined(standardContent)) {
      throw new Error(
        'The crm-hygiene skill is missing from the standard application definition',
      );
    }

    const skillToUpdate = buildSkillContentReplacement({
      skill:
        flatSkillMaps.byUniversalIdentifier[
          CRM_HYGIENE_SKILL_UNIVERSAL_IDENTIFIER
        ],
      fromContent:
        direction === 'up'
          ? CRM_HYGIENE_SKILL_CONTENT_BEFORE_MERGE_TOOL
          : standardContent,
      toContent:
        direction === 'up'
          ? standardContent
          : CRM_HYGIENE_SKILL_CONTENT_BEFORE_MERGE_TOOL,
    });

    if (!isDefined(skillToUpdate)) {
      this.logger.log(
        `The crm-hygiene skill is missing or its content was edited in workspace ${workspaceId}, skipping`,
      );

      return;
    }

    this.logger.log(
      `${options.dryRun ? '[DRY RUN] ' : ''}Workspace ${workspaceId} (${direction}): updating the crm-hygiene skill content`,
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
        `Failed to update the crm-hygiene skill for workspace ${workspaceId}`,
      );
    }
  }
}
