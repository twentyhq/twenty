import { Command } from 'nest-commander';
import { TWENTY_STANDARD_APPLICATION_UNIVERSAL_IDENTIFIER } from 'twenty-shared/application';
import { STANDARD_OBJECTS } from 'twenty-shared/metadata';
import { isDefined, isNonEmptyArray } from 'twenty-shared/utils';

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

const RESOLVED_MENTION_FIELD_UNIVERSAL_IDENTIFIER =
  STANDARD_OBJECTS.agentChatThreadParticipant.fields.lastResolvedMentionAt
    .universalIdentifier;

@RegisteredWorkspaceCommand('2.54.0', 1793277012732)
@Command({
  name: 'upgrade:2-54:add-chat-mention-resolution',
  description: 'Track resolved chat mentions',
})
export class AddChatMentionResolutionCommand extends ProvisionedWorkspaceCommandRunner {
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
    const { flatObjectMetadataMaps, flatFieldMetadataMaps } =
      await this.workspaceCacheService.getOrRecompute(workspaceId, [
        'flatObjectMetadataMaps',
        'flatFieldMetadataMaps',
      ]);

    if (
      !isDefined(
        flatObjectMetadataMaps.byUniversalIdentifier[
          STANDARD_OBJECTS.agentChatThreadParticipant.universalIdentifier
        ],
      )
    ) {
      return;
    }

    if (options.dryRun) {
      this.logger.log(
        `[DRY RUN] Workspace ${workspaceId}: add mention resolution`,
      );

      return;
    }

    const { twentyStandardFlatApplication } =
      await this.applicationService.findWorkspaceTwentyStandardAndCustomApplicationOrThrow(
        { workspaceId },
      );
    const fieldsToCreate =
      getStandardFlatEntitiesToCreateOrThrow<FlatFieldMetadata>({
        standardFlatEntityMaps:
          computeTwentyStandardApplicationAllFlatEntityMaps({
            now: new Date().toISOString(),
            workspaceId,
            twentyStandardApplicationId: twentyStandardFlatApplication.id,
          }).allFlatEntityMaps.flatFieldMetadataMaps,
        existingFlatEntityMaps: flatFieldMetadataMaps,
        universalIdentifiers: [RESOLVED_MENTION_FIELD_UNIVERSAL_IDENTIFIER],
      });

    if (isNonEmptyArray(fieldsToCreate)) {
      await this.migrateFieldsOrThrow({
        workspaceId,
        fieldsToCreate,
        fieldsToDelete: [],
      });
    }
  }

  async down({ workspaceId, options }: RunOnWorkspaceArgs): Promise<void> {
    const { flatFieldMetadataMaps } =
      await this.workspaceCacheService.getOrRecompute(workspaceId, [
        'flatFieldMetadataMaps',
      ]);
    const field = findFlatEntityByUniversalIdentifier<FlatFieldMetadata>({
      flatEntityMaps: flatFieldMetadataMaps,
      universalIdentifier: RESOLVED_MENTION_FIELD_UNIVERSAL_IDENTIFIER,
    });

    if (!isDefined(field) || options.dryRun) {
      return;
    }

    await this.migrateFieldsOrThrow({
      workspaceId,
      fieldsToCreate: [],
      fieldsToDelete: [field],
    });
  }

  private async migrateFieldsOrThrow({
    workspaceId,
    fieldsToCreate,
    fieldsToDelete,
  }: {
    workspaceId: string;
    fieldsToCreate: FlatFieldMetadata[];
    fieldsToDelete: FlatFieldMetadata[];
  }): Promise<void> {
    const result =
      await this.workspaceMigrationValidateBuildAndRunService.validateBuildAndRunLegacyWorkspaceMigration(
        {
          workspaceId,
          isSystemBuild: true,
          applicationUniversalIdentifier:
            TWENTY_STANDARD_APPLICATION_UNIVERSAL_IDENTIFIER,
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
        `Failed to migrate chat mention resolution for workspace ${workspaceId}`,
      );
    }
  }
}
