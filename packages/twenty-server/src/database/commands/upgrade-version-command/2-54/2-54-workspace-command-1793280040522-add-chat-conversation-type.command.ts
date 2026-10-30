import { Inject } from '@nestjs/common';

import { Command } from 'nest-commander';
import { STANDARD_OBJECTS } from 'twenty-shared/metadata';
import { doNotTranslate } from 'twenty-shared/i18n';
import { isDefined } from 'twenty-shared/utils';

import { ProvisionedWorkspaceCommandRunner } from 'src/database/commands/command-runners/provisioned-workspace.command-runner';
import { WorkspaceIteratorService } from 'src/database/commands/command-runners/workspace-iterator.service';
import { type RunOnWorkspaceArgs } from 'src/database/commands/command-runners/workspace.command-runner';
import { getStandardFlatEntitiesToCreateOrThrow } from 'src/database/commands/upgrade-version-command/2-10/utils/get-standard-flat-entities-to-create-or-throw.util';
import { ApplicationService } from 'src/engine/core-modules/application/application.service';
import { RegisteredWorkspaceCommand } from 'src/engine/core-modules/upgrade/decorators/registered-workspace-command.decorator';
import { findFlatEntityByUniversalIdentifier } from 'src/engine/metadata-modules/flat-entity/utils/find-flat-entity-by-universal-identifier.util';
import { type FlatFieldMetadata } from 'src/engine/metadata-modules/flat-field-metadata/types/flat-field-metadata.type';
import { WorkspaceCacheService } from 'src/engine/workspace-cache/services/workspace-cache.service';
import { computeTwentyStandardApplicationAllFlatEntityMaps } from 'src/engine/workspace-manager/twenty-standard-application/utils/twenty-standard-application-all-flat-entity-maps.constant';
import { WorkspaceMigrationBuilderException } from 'src/engine/workspace-manager/workspace-migration/exceptions/workspace-migration-builder-exception';
import { WorkspaceMigrationValidateBuildAndRunService } from 'src/engine/workspace-manager/workspace-migration/services/workspace-migration-validate-build-and-run-service';

const CONVERSATION_TYPE_FIELD_UNIVERSAL_IDENTIFIER =
  STANDARD_OBJECTS.agentChatThread.fields.conversationType.universalIdentifier;

@RegisteredWorkspaceCommand('2.54.0', 1793280040522)
@Command({
  name: 'upgrade:2-54:add-chat-conversation-type',
  description: doNotTranslate(
    'Persist the system-managed conversation type without reclassifying existing chats',
  ),
})
export class AddChatConversationTypeCommand extends ProvisionedWorkspaceCommandRunner {
  @Inject(ApplicationService)
  private readonly applicationService: ApplicationService;

  @Inject(WorkspaceCacheService)
  private readonly workspaceCacheService: WorkspaceCacheService;

  @Inject(WorkspaceMigrationValidateBuildAndRunService)
  private readonly workspaceMigrationValidateBuildAndRunService: WorkspaceMigrationValidateBuildAndRunService;

  constructor(
    protected readonly workspaceIteratorService: WorkspaceIteratorService,
  ) {
    super(workspaceIteratorService);
  }

  override async runOnWorkspace(args: RunOnWorkspaceArgs): Promise<void> {
    await this.up(args);
  }

  async up({ workspaceId, options }: RunOnWorkspaceArgs): Promise<void> {
    const { flatObjectMetadataMaps, flatFieldMetadataMaps } =
      await this.workspaceCacheService.getOrRecompute(workspaceId, [
        'flatObjectMetadataMaps',
        'flatFieldMetadataMaps',
      ]);
    const threadObject =
      flatObjectMetadataMaps.byUniversalIdentifier[
        STANDARD_OBJECTS.agentChatThread.universalIdentifier
      ];
    const existingField =
      findFlatEntityByUniversalIdentifier<FlatFieldMetadata>({
        flatEntityMaps: flatFieldMetadataMaps,
        universalIdentifier: CONVERSATION_TYPE_FIELD_UNIVERSAL_IDENTIFIER,
      });

    if (!isDefined(threadObject) || isDefined(existingField)) {
      return;
    }

    const { twentyStandardFlatApplication } =
      await this.applicationService.findWorkspaceTwentyStandardAndCustomApplicationOrThrow(
        { workspaceId },
      );
    const { allFlatEntityMaps } =
      computeTwentyStandardApplicationAllFlatEntityMaps({
        now: new Date().toISOString(),
        workspaceId,
        twentyStandardApplicationId: twentyStandardFlatApplication.id,
      });
    const fieldsToCreate =
      getStandardFlatEntitiesToCreateOrThrow<FlatFieldMetadata>({
        standardFlatEntityMaps: allFlatEntityMaps.flatFieldMetadataMaps,
        existingFlatEntityMaps: flatFieldMetadataMaps,
        universalIdentifiers: [CONVERSATION_TYPE_FIELD_UNIVERSAL_IDENTIFIER],
      });

    await this.migrateField({
      workspaceId,
      options,
      fieldsToCreate,
      fieldsToDelete: [],
    });
  }

  async down({ workspaceId, options }: RunOnWorkspaceArgs): Promise<void> {
    const { flatFieldMetadataMaps } =
      await this.workspaceCacheService.getOrRecompute(workspaceId, [
        'flatFieldMetadataMaps',
      ]);
    const field = findFlatEntityByUniversalIdentifier<FlatFieldMetadata>({
      flatEntityMaps: flatFieldMetadataMaps,
      universalIdentifier: CONVERSATION_TYPE_FIELD_UNIVERSAL_IDENTIFIER,
    });

    if (!isDefined(field)) {
      return;
    }

    await this.migrateField({
      workspaceId,
      options,
      fieldsToCreate: [],
      fieldsToDelete: [field],
    });
  }

  private async migrateField({
    workspaceId,
    options,
    fieldsToCreate,
    fieldsToDelete,
  }: Pick<RunOnWorkspaceArgs, 'workspaceId' | 'options'> & {
    fieldsToCreate: FlatFieldMetadata[];
    fieldsToDelete: FlatFieldMetadata[];
  }): Promise<void> {
    if (options.dryRun ?? false) {
      this.logger.log(
        doNotTranslate(
          `[DRY RUN] Would create ${fieldsToCreate.length} and delete ${fieldsToDelete.length} conversation type fields for workspace ${workspaceId}`,
        ),
      );

      return;
    }

    const { twentyStandardFlatApplication } =
      await this.applicationService.findWorkspaceTwentyStandardAndCustomApplicationOrThrow(
        { workspaceId },
      );
    const result =
      await this.workspaceMigrationValidateBuildAndRunService.validateBuildAndRunLegacyWorkspaceMigration(
        {
          shouldDeferActions: false,
          workspaceId,
          isSystemBuild: true,
          applicationUniversalIdentifier:
            twentyStandardFlatApplication.universalIdentifier,
          allFlatEntityOperationByMetadataName: {
            fieldMetadata: {
              flatEntityToCreate: fieldsToCreate,
              flatEntityToDelete: fieldsToDelete,
              flatEntityToUpdate: [],
            },
          },
        },
      );

    if (result.status === 'fail') {
      throw new WorkspaceMigrationBuilderException(
        result,
        doNotTranslate(
          `Failed to migrate conversation type for workspace ${workspaceId}`,
        ),
      );
    }
  }
}
