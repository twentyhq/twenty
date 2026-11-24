import { Command } from 'nest-commander';
import { STANDARD_OBJECTS } from 'twenty-shared/metadata';
import { isDefined } from 'twenty-shared/utils';

import { ProvisionedWorkspaceCommandRunner } from 'src/database/commands/command-runners/provisioned-workspace.command-runner';
import { WorkspaceIteratorService } from 'src/database/commands/command-runners/workspace-iterator.service';
import { type RunOnWorkspaceArgs } from 'src/database/commands/command-runners/workspace.command-runner';
import { getStandardFlatEntitiesToCreateOrThrow } from 'src/database/commands/upgrade-version-command/2-10/utils/get-standard-flat-entities-to-create-or-throw.util';
import { ApplicationService } from 'src/engine/core-modules/application/application.service';
import { RegisteredWorkspaceCommand } from 'src/engine/core-modules/upgrade/decorators/registered-workspace-command.decorator';
import { type FlatFieldMetadata } from 'src/engine/metadata-modules/flat-field-metadata/types/flat-field-metadata.type';
import { WorkspaceCacheService } from 'src/engine/workspace-cache/services/workspace-cache.service';
import { computeTwentyStandardApplicationAllFlatEntityMaps } from 'src/engine/workspace-manager/twenty-standard-application/utils/twenty-standard-application-all-flat-entity-maps.constant';
import { WorkspaceMigrationBuilderException } from 'src/engine/workspace-manager/workspace-migration/exceptions/workspace-migration-builder-exception';
import { WorkspaceMigrationValidateBuildAndRunService } from 'src/engine/workspace-manager/workspace-migration/services/workspace-migration-validate-build-and-run-service';

const FIELD_UNIVERSAL_IDENTIFIERS = [
  STANDARD_OBJECTS.calendarChannelEventAssociation.fields.accountOwner
    .universalIdentifier,
  STANDARD_OBJECTS.calendarChannelEventAssociation.fields.handle
    .universalIdentifier,
  STANDARD_OBJECTS.messageChannelMessageAssociation.fields.accountOwner
    .universalIdentifier,
  STANDARD_OBJECTS.messageChannelMessageAssociation.fields.handle
    .universalIdentifier,
  STANDARD_OBJECTS.workspaceMember.fields
    .accountOwnerForCalendarChannelEventAssociations.universalIdentifier,
  STANDARD_OBJECTS.workspaceMember.fields
    .accountOwnerForMessageChannelMessageAssociations.universalIdentifier,
];

@RegisteredWorkspaceCommand('2.64.0', 1795542028209)
@Command({
  name: 'upgrade:2-64:add-channel-association-dynamic-account-owner-and-handle',
  description:
    'Add the dynamic account owner relation and channel handle fields to calendar and message channel associations',
})
export class AddChannelAssociationDynamicAccountOwnerAndHandleCommand extends ProvisionedWorkspaceCommandRunner {
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
    const { flatObjectMetadataMaps, flatFieldMetadataMaps } =
      await this.workspaceCacheService.getOrRecompute(workspaceId, [
        'flatObjectMetadataMaps',
        'flatFieldMetadataMaps',
      ]);

    const missingObjectUniversalIdentifier = [
      STANDARD_OBJECTS.calendarChannelEventAssociation.universalIdentifier,
      STANDARD_OBJECTS.messageChannelMessageAssociation.universalIdentifier,
      STANDARD_OBJECTS.workspaceMember.universalIdentifier,
    ].find(
      (objectUniversalIdentifier) =>
        !isDefined(
          flatObjectMetadataMaps.byUniversalIdentifier[
            objectUniversalIdentifier
          ],
        ),
    );

    if (isDefined(missingObjectUniversalIdentifier)) {
      this.logger.warn(
        `Object ${missingObjectUniversalIdentifier} not found for workspace ${workspaceId}, skipping dynamic account owner and handle creation`,
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

    const fieldsToCreate =
      getStandardFlatEntitiesToCreateOrThrow<FlatFieldMetadata>({
        standardFlatEntityMaps: standardAllFlatEntityMaps.flatFieldMetadataMaps,
        existingFlatEntityMaps: flatFieldMetadataMaps,
        universalIdentifiers: FIELD_UNIVERSAL_IDENTIFIERS,
      });

    if (fieldsToCreate.length === 0) {
      return;
    }

    if (options.dryRun ?? false) {
      this.logger.log(
        `[DRY RUN] Would create ${fieldsToCreate.length} dynamic field(s) for workspace ${workspaceId}`,
      );

      return;
    }

    const result =
      await this.workspaceMigrationValidateBuildAndRunService.validateBuildAndRunLegacyWorkspaceMigration(
        {
          shouldDeferActions: false,
          isSystemBuild: true,
          applicationUniversalIdentifier:
            twentyStandardFlatApplication.universalIdentifier,
          workspaceId,
          allFlatEntityOperationByMetadataName: {
            fieldMetadata: {
              flatEntityToCreate: fieldsToCreate,
              flatEntityToDelete: [],
              flatEntityToUpdate: [],
            },
          },
        },
      );

    if (result.status === 'fail') {
      throw new WorkspaceMigrationBuilderException(result);
    }

    this.logger.log(
      `Created ${fieldsToCreate.length} dynamic field(s) for workspace ${workspaceId}`,
    );
  }
}
