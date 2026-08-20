import { Command } from 'nest-commander';

import { STANDARD_OBJECTS } from 'twenty-shared/metadata';
import { FieldMetadataType, MessageCampaignStatus } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';

import { ProvisionedWorkspaceCommandRunner } from 'src/database/commands/command-runners/provisioned-workspace.command-runner';
import { WorkspaceIteratorService } from 'src/database/commands/command-runners/workspace-iterator.service';
import { type RunOnWorkspaceArgs } from 'src/database/commands/command-runners/workspace.command-runner';
import { ApplicationService } from 'src/engine/core-modules/application/application.service';
import { RegisteredWorkspaceCommand } from 'src/engine/core-modules/upgrade/decorators/registered-workspace-command.decorator';
import { findFlatEntityByUniversalIdentifier } from 'src/engine/metadata-modules/flat-entity/utils/find-flat-entity-by-universal-identifier.util';
import { type FlatFieldMetadata } from 'src/engine/metadata-modules/flat-field-metadata/types/flat-field-metadata.type';
import { WorkspaceCacheService } from 'src/engine/workspace-cache/services/workspace-cache.service';
import { computeTwentyStandardApplicationAllFlatEntityMaps } from 'src/engine/workspace-manager/twenty-standard-application/utils/twenty-standard-application-all-flat-entity-maps.constant';
import { WorkspaceMigrationValidateBuildAndRunService } from 'src/engine/workspace-manager/workspace-migration/services/workspace-migration-validate-build-and-run-service';

const STATUS_FIELD_UNIVERSAL_IDENTIFIER =
  STANDARD_OBJECTS.messageCampaign.fields.status.universalIdentifier;

@RegisteredWorkspaceCommand('2.33.0', 1787200060000)
@Command({
  name: 'upgrade:2-33:add-canceled-message-campaign-status',
  description:
    'Add the CANCELED option to the MessageCampaign status select in existing workspaces',
})
export class AddCanceledMessageCampaignStatusCommand extends ProvisionedWorkspaceCommandRunner {
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
    const { flatFieldMetadataMaps } =
      await this.workspaceCacheService.getOrRecompute(workspaceId, [
        'flatFieldMetadataMaps',
      ]);

    const statusField = findFlatEntityByUniversalIdentifier<FlatFieldMetadata>({
      flatEntityMaps: flatFieldMetadataMaps,
      universalIdentifier: STATUS_FIELD_UNIVERSAL_IDENTIFIER,
    });

    if (!isDefined(statusField)) {
      this.logger.log(
        `messageCampaign status field does not exist for workspace ${workspaceId}, skipping`,
      );

      return;
    }

    if (statusField.type !== FieldMetadataType.SELECT) {
      throw new Error(
        `messageCampaign status is not a SELECT field for workspace ${workspaceId}`,
      );
    }

    const hasCanceledOption = (statusField.options ?? []).some(
      (option) => option.value === MessageCampaignStatus.CANCELED,
    );

    if (hasCanceledOption) {
      return;
    }

    const isDryRun = options.dryRun ?? false;

    if (isDryRun) {
      this.logger.log(
        `[DRY RUN] Would add CANCELED to messageCampaign status for workspace ${workspaceId}`,
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

    const standardStatusField =
      findFlatEntityByUniversalIdentifier<FlatFieldMetadata>({
        flatEntityMaps: standardAllFlatEntityMaps.flatFieldMetadataMaps,
        universalIdentifier: STATUS_FIELD_UNIVERSAL_IDENTIFIER,
      });

    if (
      !isDefined(standardStatusField) ||
      standardStatusField.type !== FieldMetadataType.SELECT
    ) {
      throw new Error(
        'Standard application is missing the messageCampaign status select',
      );
    }

    const updatedStatusField: FlatFieldMetadata = {
      ...statusField,
      options: standardStatusField.options,
      updatedAt: new Date().toISOString(),
    };

    const result =
      await this.workspaceMigrationValidateBuildAndRunService.validateBuildAndRunLegacyWorkspaceMigration(
        {
          isSystemBuild: true,
          workspaceId,
          applicationUniversalIdentifier:
            twentyStandardFlatApplication.universalIdentifier,
          allFlatEntityOperationByMetadataName: {
            fieldMetadata: {
              flatEntityToCreate: [],
              flatEntityToDelete: [],
              flatEntityToUpdate: [updatedStatusField],
            },
          },
        },
      );

    if (result.status === 'fail') {
      this.logger.error(
        `Failed to add CANCELED status option:\n${JSON.stringify(result, null, 2)}`,
      );

      throw new Error(
        `Failed to add CANCELED status option for workspace ${workspaceId}`,
      );
    }

    this.logger.log(
      `Added CANCELED status option for workspace ${workspaceId}`,
    );
  }
}
