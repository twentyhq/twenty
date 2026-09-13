import { Command } from 'nest-commander';
import { STANDARD_OBJECTS } from 'twenty-shared/metadata';
import { isDefined } from 'twenty-shared/utils';

import { ProvisionedWorkspaceCommandRunner } from 'src/database/commands/command-runners/provisioned-workspace.command-runner';
import { WorkspaceIteratorService } from 'src/database/commands/command-runners/workspace-iterator.service';
import { type RunOnWorkspaceArgs } from 'src/database/commands/command-runners/workspace.command-runner';
import { getStandardFlatEntitiesToCreateOrThrow } from 'src/database/commands/upgrade-version-command/2-10/utils/get-standard-flat-entities-to-create-or-throw.util';
import { ApplicationService } from 'src/engine/core-modules/application/application.service';
import { RegisteredWorkspaceCommand } from 'src/engine/core-modules/upgrade/decorators/registered-workspace-command.decorator';
import { type FlatCommandMenuItem } from 'src/engine/metadata-modules/flat-command-menu-item/types/flat-command-menu-item.type';
import { type FlatFieldMetadata } from 'src/engine/metadata-modules/flat-field-metadata/types/flat-field-metadata.type';
import { WorkspaceCacheService } from 'src/engine/workspace-cache/services/workspace-cache.service';
import { STANDARD_COMMAND_MENU_ITEMS } from 'src/engine/workspace-manager/twenty-standard-application/constants/standard-command-menu-item.constant';
import { computeTwentyStandardApplicationAllFlatEntityMaps } from 'src/engine/workspace-manager/twenty-standard-application/utils/twenty-standard-application-all-flat-entity-maps.constant';
import { WorkspaceMigrationValidateBuildAndRunService } from 'src/engine/workspace-manager/workspace-migration/services/workspace-migration-validate-build-and-run-service';

const PERSON = STANDARD_OBJECTS.person;

const EMAIL_TRACKING_CONSENT_FIELD_UNIVERSAL_IDENTIFIER =
  PERSON.fields.emailTrackingConsent.universalIdentifier;

const SET_EMAIL_TRACKING_CONSENT_COMMAND_UNIVERSAL_IDENTIFIER =
  STANDARD_COMMAND_MENU_ITEMS.setPersonEmailTrackingConsent.universalIdentifier;

@RegisteredWorkspaceCommand('2.40.0', 1789311770162)
@Command({
  name: 'upgrade:2-40:add-person-email-tracking-consent',
  description:
    'Add the emailTrackingConsent field to person and the Set Email Tracking command on existing workspaces',
})
export class AddPersonEmailTrackingConsentCommand extends ProvisionedWorkspaceCommandRunner {
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

    const {
      flatObjectMetadataMaps,
      flatFieldMetadataMaps,
      flatCommandMenuItemMaps,
    } = await this.workspaceCacheService.getOrRecompute(workspaceId, [
      'flatObjectMetadataMaps',
      'flatFieldMetadataMaps',
      'flatCommandMenuItemMaps',
    ]);

    if (
      !isDefined(
        flatObjectMetadataMaps.byUniversalIdentifier[PERSON.universalIdentifier],
      )
    ) {
      this.logger.log(
        `person object does not exist for workspace ${workspaceId}, skipping`,
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

    const fieldsToCreate = getStandardFlatEntitiesToCreateOrThrow<
      FlatFieldMetadata
    >({
      standardFlatEntityMaps: standardAllFlatEntityMaps.flatFieldMetadataMaps,
      existingFlatEntityMaps: flatFieldMetadataMaps,
      universalIdentifiers: [EMAIL_TRACKING_CONSENT_FIELD_UNIVERSAL_IDENTIFIER],
    });

    const commandMenuItemsToCreate = getStandardFlatEntitiesToCreateOrThrow<
      FlatCommandMenuItem
    >({
      standardFlatEntityMaps: standardAllFlatEntityMaps.flatCommandMenuItemMaps,
      existingFlatEntityMaps: flatCommandMenuItemMaps,
      universalIdentifiers: [
        SET_EMAIL_TRACKING_CONSENT_COMMAND_UNIVERSAL_IDENTIFIER,
      ],
    });

    if (isDryRun) {
      this.logger.log(
        `[DRY RUN] Workspace ${workspaceId}: ${fieldsToCreate.length} field(s), ${commandMenuItemsToCreate.length} command(s)`,
      );

      return;
    }

    if (fieldsToCreate.length === 0 && commandMenuItemsToCreate.length === 0) {
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
              flatEntityToCreate: fieldsToCreate,
              flatEntityToDelete: [],
              flatEntityToUpdate: [],
            },
            commandMenuItem: {
              flatEntityToCreate: commandMenuItemsToCreate,
              flatEntityToDelete: [],
              flatEntityToUpdate: [],
            },
          },
        },
      );

    if (result.status === 'fail') {
      this.logger.error(
        `Failed to add the person emailTrackingConsent field:\n${JSON.stringify(result, null, 2)}`,
      );

      throw new Error(
        `Failed to add the person emailTrackingConsent field for workspace ${workspaceId}`,
      );
    }
  }
}
