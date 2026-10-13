import { Command } from 'nest-commander';
import { isDefined } from 'twenty-shared/utils';

import { ProvisionedWorkspaceCommandRunner } from 'src/database/commands/command-runners/provisioned-workspace.command-runner';
import { WorkspaceIteratorService } from 'src/database/commands/command-runners/workspace-iterator.service';
import { type RunOnWorkspaceArgs } from 'src/database/commands/command-runners/workspace.command-runner';
import { ApplicationService } from 'src/engine/core-modules/application/application.service';
import { RegisteredWorkspaceCommand } from 'src/engine/core-modules/upgrade/decorators/registered-workspace-command.decorator';
import { WorkspaceCacheService } from 'src/engine/workspace-cache/services/workspace-cache.service';
import { computeTwentyStandardApplicationAllFlatEntityMaps } from 'src/engine/workspace-manager/twenty-standard-application/utils/twenty-standard-application-all-flat-entity-maps.constant';
import { WorkspaceMigrationBuilderException } from 'src/engine/workspace-manager/workspace-migration/exceptions/workspace-migration-builder-exception';
import { WorkspaceMigrationValidateBuildAndRunService } from 'src/engine/workspace-manager/workspace-migration/services/workspace-migration-validate-build-and-run-service';

const AGENT_BUILDING_SKILL_UNIVERSAL_IDENTIFIER =
  '20202020-17de-403d-a29d-6994eb10d677';

@RegisteredWorkspaceCommand('2.47.0', 1791906324176)
@Command({
  name: 'upgrade:2-47:add-agent-building-skill',
  description:
    'Add the standard agent-building skill to existing workspaces',
})
export class AddAgentBuildingSkillCommand extends ProvisionedWorkspaceCommandRunner {
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

  async up({ workspaceId, options }: RunOnWorkspaceArgs): Promise<void> {
    const { twentyStandardFlatApplication } =
      await this.applicationService.findWorkspaceTwentyStandardAndCustomApplicationOrThrow(
        { workspaceId },
      );

    const { flatSkillMaps } = await this.workspaceCacheService.getOrRecompute(
      workspaceId,
      ['flatSkillMaps'],
    );

    if (
      isDefined(
        flatSkillMaps.byUniversalIdentifier[
          AGENT_BUILDING_SKILL_UNIVERSAL_IDENTIFIER
        ],
      )
    ) {
      return;
    }

    const agentBuildingSkill = computeTwentyStandardApplicationAllFlatEntityMaps(
      {
        now: new Date().toISOString(),
        workspaceId,
        twentyStandardApplicationId: twentyStandardFlatApplication.id,
      },
    ).allFlatEntityMaps.flatSkillMaps.byUniversalIdentifier[
      AGENT_BUILDING_SKILL_UNIVERSAL_IDENTIFIER
    ];

    if (!isDefined(agentBuildingSkill)) {
      return;
    }

    // Skill names are unique per workspace, so a skill the workspace already named this way keeps it
    const isNameTaken = Object.values(flatSkillMaps.byUniversalIdentifier)
      .filter(isDefined)
      .some((skill) => skill.name === agentBuildingSkill.name);

    if (isNameTaken) {
      this.logger.warn(
        `Workspace ${workspaceId} already has a skill named ${agentBuildingSkill.name}, skipping the standard one`,
      );

      return;
    }

    this.logger.log(
      `${options.dryRun ? '[DRY RUN] ' : ''}Workspace ${workspaceId}: adding the ${agentBuildingSkill.name} skill`,
    );

    if (options.dryRun) {
      return;
    }

    const result =
      await this.workspaceMigrationValidateBuildAndRunService.validateBuildAndRunLegacyWorkspaceMigration(
        {
          workspaceId,
          applicationUniversalIdentifier:
            twentyStandardFlatApplication.universalIdentifier,
          allFlatEntityOperationByMetadataName: {
            skill: {
              flatEntityToCreate: [agentBuildingSkill],
              flatEntityToDelete: [],
              flatEntityToUpdate: [],
            },
          },
        },
      );

    if (result.status === 'fail') {
      throw new WorkspaceMigrationBuilderException(result);
    }
  }

  async down({ workspaceId, options }: RunOnWorkspaceArgs): Promise<void> {
    const { twentyStandardFlatApplication } =
      await this.applicationService.findWorkspaceTwentyStandardAndCustomApplicationOrThrow(
        { workspaceId },
      );

    const { flatSkillMaps } = await this.workspaceCacheService.getOrRecompute(
      workspaceId,
      ['flatSkillMaps'],
    );

    const agentBuildingSkill =
      flatSkillMaps.byUniversalIdentifier[
        AGENT_BUILDING_SKILL_UNIVERSAL_IDENTIFIER
      ];

    if (!isDefined(agentBuildingSkill)) {
      return;
    }

    this.logger.log(
      `${options.dryRun ? '[DRY RUN] ' : ''}Workspace ${workspaceId}: removing the ${agentBuildingSkill.name} skill`,
    );

    if (options.dryRun) {
      return;
    }

    const result =
      await this.workspaceMigrationValidateBuildAndRunService.validateBuildAndRunLegacyWorkspaceMigration(
        {
          workspaceId,
          applicationUniversalIdentifier:
            twentyStandardFlatApplication.universalIdentifier,
          allFlatEntityOperationByMetadataName: {
            skill: {
              flatEntityToCreate: [],
              flatEntityToDelete: [agentBuildingSkill],
              flatEntityToUpdate: [],
            },
          },
        },
      );

    if (result.status === 'fail') {
      throw new WorkspaceMigrationBuilderException(result);
    }
  }
}
