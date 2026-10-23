import { Command } from 'nest-commander';
import { TWENTY_STANDARD_APPLICATION_UNIVERSAL_IDENTIFIER } from 'twenty-shared/application';
import { isDefined } from 'twenty-shared/utils';

import { ProvisionedWorkspaceCommandRunner } from 'src/database/commands/command-runners/provisioned-workspace.command-runner';
import { WorkspaceIteratorService } from 'src/database/commands/command-runners/workspace-iterator.service';
import { type RunOnWorkspaceArgs } from 'src/database/commands/command-runners/workspace.command-runner';
import { ApplicationService } from 'src/engine/core-modules/application/application.service';
import { RegisteredWorkspaceCommand } from 'src/engine/core-modules/upgrade/decorators/registered-workspace-command.decorator';
import { type FlatSkill } from 'src/engine/metadata-modules/flat-skill/types/flat-skill.type';
import { WorkspaceCacheService } from 'src/engine/workspace-cache/services/workspace-cache.service';
import { computeTwentyStandardApplicationAllFlatEntityMaps } from 'src/engine/workspace-manager/twenty-standard-application/utils/twenty-standard-application-all-flat-entity-maps.constant';
import { WorkspaceMigrationBuilderException } from 'src/engine/workspace-manager/workspace-migration/exceptions/workspace-migration-builder-exception';
import { WorkspaceMigrationValidateBuildAndRunService } from 'src/engine/workspace-manager/workspace-migration/services/workspace-migration-validate-build-and-run-service';

@RegisteredWorkspaceCommand('2.52.0', 1792764632845)
@Command({
  name: 'upgrade:2-52:reconcile-standard-skill-catalog',
  description:
    'Reconcile the standard skill catalog in existing workspaces again, so the skill content changed since 2.40 reaches them: create the new skills, refresh the catalog-owned fields on existing ones, and delete the skills that left the catalog',
})
export class ReconcileStandardSkillCatalogCommand extends ProvisionedWorkspaceCommandRunner {
  constructor(
    protected readonly workspaceIteratorService: WorkspaceIteratorService,
    private readonly applicationService: ApplicationService,
    private readonly workspaceMigrationValidateBuildAndRunService: WorkspaceMigrationValidateBuildAndRunService,
    private readonly workspaceCacheService: WorkspaceCacheService,
  ) {
    super(workspaceIteratorService);
  }

  override async runOnWorkspace(args: RunOnWorkspaceArgs): Promise<void> {
    await this.up(args);
  }

  async up({ workspaceId, options }: RunOnWorkspaceArgs): Promise<void> {
    const isDryRun = options.dryRun ?? false;

    const { twentyStandardFlatApplication } =
      await this.applicationService.findWorkspaceTwentyStandardAndCustomApplicationOrThrow(
        { workspaceId },
      );

    const { flatSkillMaps: existingFlatSkillMaps } =
      await this.workspaceCacheService.getOrRecompute(workspaceId, [
        'flatSkillMaps',
      ]);

    const { allFlatEntityMaps: standardAllFlatEntityMaps } =
      computeTwentyStandardApplicationAllFlatEntityMaps({
        now: new Date().toISOString(),
        workspaceId,
        twentyStandardApplicationId: twentyStandardFlatApplication.id,
      });

    const standardSkills = Object.values(
      standardAllFlatEntityMaps.flatSkillMaps.byUniversalIdentifier,
    ).filter(isDefined);

    const existingSkills = Object.values(
      existingFlatSkillMaps.byUniversalIdentifier,
    ).filter(isDefined);

    const standardSkillUniversalIdentifiers = new Set(
      standardSkills.map((standardSkill) => standardSkill.universalIdentifier),
    );

    const skillsToDelete = existingSkills.filter(
      (existingSkill) =>
        existingSkill.applicationId === twentyStandardFlatApplication.id &&
        !standardSkillUniversalIdentifiers.has(
          existingSkill.universalIdentifier,
        ),
    );

    const universalIdentifiersToDelete = new Set(
      skillsToDelete.map((skillToDelete) => skillToDelete.universalIdentifier),
    );

    // Skill names are unique per workspace, and one rejected create would fail the whole migration
    const takenNames = new Set(
      existingSkills
        .filter(
          (existingSkill) =>
            !universalIdentifiersToDelete.has(existingSkill.universalIdentifier),
        )
        .map((existingSkill) => existingSkill.name),
    );

    const missingSkills = standardSkills.filter(
      (standardSkill) =>
        !isDefined(
          existingFlatSkillMaps.byUniversalIdentifier[
            standardSkill.universalIdentifier
          ],
        ),
    );

    const skillsToCreate = missingSkills.filter(
      (missingSkill) => !takenNames.has(missingSkill.name),
    );

    const skillsSkippedForNameClash = missingSkills.filter((missingSkill) =>
      takenNames.has(missingSkill.name),
    );

    if (skillsSkippedForNameClash.length > 0) {
      this.logger.warn(
        `Workspace ${workspaceId} already has a skill named ${skillsSkippedForNameClash.map((skill) => skill.name).join(', ')}; skipping ${skillsSkippedForNameClash.length === 1 ? 'that standard skill' : 'those standard skills'}`,
      );
    }

    const skillsToUpdate = standardSkills.reduce<FlatSkill[]>(
      (accumulator, standardSkill) => {
        const existingSkill =
          existingFlatSkillMaps.byUniversalIdentifier[
            standardSkill.universalIdentifier
          ];

        if (!isDefined(existingSkill)) {
          return accumulator;
        }

        const hasCatalogChange =
          existingSkill.isSystem !== standardSkill.isSystem ||
          existingSkill.label !== standardSkill.label ||
          existingSkill.description !== standardSkill.description ||
          existingSkill.icon !== standardSkill.icon ||
          existingSkill.content !== standardSkill.content;

        if (!hasCatalogChange) {
          return accumulator;
        }

        // isActive is the user's call, so the refresh must not reactivate a skill someone turned off
        accumulator.push({
          ...existingSkill,
          isSystem: standardSkill.isSystem,
          label: standardSkill.label,
          description: standardSkill.description,
          icon: standardSkill.icon,
          content: standardSkill.content,
        });

        return accumulator;
      },
      [],
    );

    if (
      skillsToCreate.length === 0 &&
      skillsToUpdate.length === 0 &&
      skillsToDelete.length === 0
    ) {
      this.logger.log(
        `Standard skills already up to date for workspace ${workspaceId}, skipping`,
      );

      return;
    }

    this.logger.log(
      `${isDryRun ? '[DRY RUN] ' : ''}Workspace ${workspaceId}: creating ${skillsToCreate.length}, updating ${skillsToUpdate.length}, deleting ${skillsToDelete.length} standard skill(s)`,
    );

    if (isDryRun) {
      return;
    }

    const result =
      await this.workspaceMigrationValidateBuildAndRunService.validateBuildAndRunLegacyWorkspaceMigration(
        {
          workspaceId,
          isSystemBuild: true,
          applicationUniversalIdentifier:
            TWENTY_STANDARD_APPLICATION_UNIVERSAL_IDENTIFIER,
          allFlatEntityOperationByMetadataName: {
            skill: {
              flatEntityToCreate: skillsToCreate,
              flatEntityToDelete: skillsToDelete,
              flatEntityToUpdate: skillsToUpdate,
            },
          },
        },
      );

    if (result.status === 'fail') {
      throw new WorkspaceMigrationBuilderException(
        result,
        `Failed to reconcile the standard skill catalog for workspace ${workspaceId}`,
      );
    }
  }
}
