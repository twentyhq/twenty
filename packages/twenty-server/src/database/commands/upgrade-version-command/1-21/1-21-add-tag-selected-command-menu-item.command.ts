import { Command } from 'nest-commander';
import { isDefined } from 'twenty-shared/utils';

import { ActiveOrSuspendedWorkspaceCommandRunner } from 'src/database/commands/command-runners/active-or-suspended-workspace.command-runner';
import { WorkspaceIteratorService } from 'src/database/commands/command-runners/workspace-iterator.service';
import { type RunOnWorkspaceArgs } from 'src/database/commands/command-runners/workspace.command-runner';
import { ApplicationService } from 'src/engine/core-modules/application/application.service';
import { WorkspaceCacheService } from 'src/engine/workspace-cache/services/workspace-cache.service';
import { STANDARD_COMMAND_MENU_ITEMS } from 'src/engine/workspace-manager/twenty-standard-application/constants/standard-command-menu-item.constant';
import { computeTwentyStandardApplicationAllFlatEntityMaps } from 'src/engine/workspace-manager/twenty-standard-application/utils/twenty-standard-application-all-flat-entity-maps.constant';
import { WorkspaceMigrationValidateBuildAndRunService } from 'src/engine/workspace-manager/workspace-migration/services/workspace-migration-validate-build-and-run-service';

const TAG_PERSON_UNIVERSAL_IDENTIFIER =
  STANDARD_COMMAND_MENU_ITEMS.tagSelectedPerson.universalIdentifier;
const TAG_COMPANY_UNIVERSAL_IDENTIFIER =
  STANDARD_COMMAND_MENU_ITEMS.tagSelectedCompany.universalIdentifier;

@Command({
  name: 'upgrade:1-21:add-tag-selected-command-menu-item',
  description:
    'Add the Tag Selected command menu items (person + company) to existing workspaces',
})
export class AddTagSelectedCommandMenuItemCommand extends ActiveOrSuspendedWorkspaceCommandRunner {
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

    this.logger.log(
      `${isDryRun ? '[DRY RUN] ' : ''}Checking tag selected commands for workspace ${workspaceId}`,
    );

    const { twentyStandardFlatApplication } =
      await this.applicationService.findWorkspaceTwentyStandardAndCustomApplicationOrThrow(
        { workspaceId },
      );

    const { flatCommandMenuItemMaps: existingFlatCommandMenuItemMaps } =
      await this.workspaceCacheService.getOrRecompute(workspaceId, [
        'flatCommandMenuItemMaps',
      ]);

    const personAlreadyExists = isDefined(
      existingFlatCommandMenuItemMaps.byUniversalIdentifier[
        TAG_PERSON_UNIVERSAL_IDENTIFIER
      ],
    );
    const companyAlreadyExists = isDefined(
      existingFlatCommandMenuItemMaps.byUniversalIdentifier[
        TAG_COMPANY_UNIVERSAL_IDENTIFIER
      ],
    );

    if (personAlreadyExists && companyAlreadyExists) {
      this.logger.log(
        `Tag selected commands already exist for workspace ${workspaceId}, skipping`,
      );

      return;
    }

    const { allFlatEntityMaps: standardAllFlatEntityMaps } =
      computeTwentyStandardApplicationAllFlatEntityMaps({
        shouldIncludeRecordPageLayouts: true,
        now: new Date().toISOString(),
        workspaceId,
        twentyStandardApplicationId: twentyStandardFlatApplication.id,
      });

    const flatEntityToCreate = [];

    if (!personAlreadyExists) {
      const itemToCreate =
        standardAllFlatEntityMaps.flatCommandMenuItemMaps.byUniversalIdentifier[
          TAG_PERSON_UNIVERSAL_IDENTIFIER
        ];

      if (!isDefined(itemToCreate)) {
        this.logger.warn(
          `Tag selected (person) command not found in standard application for workspace ${workspaceId}`,
        );
      } else {
        flatEntityToCreate.push(itemToCreate);
      }
    }

    if (!companyAlreadyExists) {
      const itemToCreate =
        standardAllFlatEntityMaps.flatCommandMenuItemMaps.byUniversalIdentifier[
          TAG_COMPANY_UNIVERSAL_IDENTIFIER
        ];

      if (!isDefined(itemToCreate)) {
        this.logger.warn(
          `Tag selected (company) command not found in standard application for workspace ${workspaceId}`,
        );
      } else {
        flatEntityToCreate.push(itemToCreate);
      }
    }

    if (flatEntityToCreate.length === 0) {
      return;
    }

    if (isDryRun) {
      this.logger.log(
        `[DRY RUN] Would create ${flatEntityToCreate.length} tag selected command(s) for workspace ${workspaceId}`,
      );

      return;
    }

    const validateAndBuildResult =
      await this.workspaceMigrationValidateBuildAndRunService.validateBuildAndRunWorkspaceMigration(
        {
          allFlatEntityOperationByMetadataName: {
            commandMenuItem: {
              flatEntityToCreate,
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
      this.logger.error(
        `Failed to add tag selected commands:\n${JSON.stringify(validateAndBuildResult, null, 2)}`,
      );

      throw new Error(
        `Failed to add tag selected commands for workspace ${workspaceId}`,
      );
    }

    this.logger.log(
      `Successfully added ${flatEntityToCreate.length} tag selected command(s) for workspace ${workspaceId}`,
    );
  }
}
