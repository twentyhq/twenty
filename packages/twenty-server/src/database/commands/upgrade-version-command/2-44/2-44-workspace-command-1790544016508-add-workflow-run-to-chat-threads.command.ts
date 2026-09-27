import { Command } from 'nest-commander';
import { STANDARD_OBJECTS } from 'twenty-shared/metadata';
import { MetadataReadability } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';

import { ProvisionedWorkspaceCommandRunner } from 'src/database/commands/command-runners/provisioned-workspace.command-runner';
import { WorkspaceIteratorService } from 'src/database/commands/command-runners/workspace-iterator.service';
import { type RunOnWorkspaceArgs } from 'src/database/commands/command-runners/workspace.command-runner';
import { getStandardFlatEntitiesToCreateOrThrow } from 'src/database/commands/upgrade-version-command/2-10/utils/get-standard-flat-entities-to-create-or-throw.util';
import { ApplicationService } from 'src/engine/core-modules/application/application.service';
import { RegisteredWorkspaceCommand } from 'src/engine/core-modules/upgrade/decorators/registered-workspace-command.decorator';
import { type FlatFieldMetadata } from 'src/engine/metadata-modules/flat-field-metadata/types/flat-field-metadata.type';
import { type FlatIndexMetadata } from 'src/engine/metadata-modules/flat-index-metadata/types/flat-index-metadata.type';
import { type FlatObjectMetadata } from 'src/engine/metadata-modules/flat-object-metadata/types/flat-object-metadata.type';
import { WorkspaceCacheService } from 'src/engine/workspace-cache/services/workspace-cache.service';
import { computeTwentyStandardApplicationAllFlatEntityMaps } from 'src/engine/workspace-manager/twenty-standard-application/utils/twenty-standard-application-all-flat-entity-maps.constant';
import { WorkspaceMigrationValidateBuildAndRunService } from 'src/engine/workspace-manager/workspace-migration/services/workspace-migration-validate-build-and-run-service';

const WORKFLOW_RUN_THREAD_FIELD_UNIVERSAL_IDENTIFIERS = [
  STANDARD_OBJECTS.agentChatThread.fields.workflowRun.universalIdentifier,
  STANDARD_OBJECTS.agentChatThread.fields.workflowStepId.universalIdentifier,
  STANDARD_OBJECTS.workflowRun.fields.agentChatThreads.universalIdentifier,
];

const WORKFLOW_RUN_THREAD_INDEX_UNIVERSAL_IDENTIFIERS = [
  STANDARD_OBJECTS.agentChatThread.indexes.workflowRunIndex.universalIdentifier,
];

// A workflow agent step now records each execution as a chat thread owned by
// its run rather than by a member. Threads therefore stop requiring an owner
// and inherit readability from the run; a thread without a run has no parent,
// so member chats keep reading exactly as they did under PRIVATE.
@RegisteredWorkspaceCommand('2.44.0', 1790544016508)
@Command({
  name: 'upgrade:2-44:add-workflow-run-to-chat-threads',
  description:
    'Link chat threads to workflow runs and make threads inherit readability from their run',
})
export class AddWorkflowRunToChatThreadsCommand extends ProvisionedWorkspaceCommandRunner {
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
    const { flatObjectMetadataMaps, flatFieldMetadataMaps, flatIndexMaps } =
      await this.workspaceCacheService.getOrRecompute(workspaceId, [
        'flatObjectMetadataMaps',
        'flatFieldMetadataMaps',
        'flatIndexMaps',
      ]);

    const threadObject =
      flatObjectMetadataMaps.byUniversalIdentifier[
        STANDARD_OBJECTS.agentChatThread.universalIdentifier
      ];
    const workflowRunObject =
      flatObjectMetadataMaps.byUniversalIdentifier[
        STANDARD_OBJECTS.workflowRun.universalIdentifier
      ];

    if (!isDefined(threadObject) || !isDefined(workflowRunObject)) {
      this.logger.log(
        `agentChatThread or workflowRun object not found for workspace ${workspaceId}, skipping`,
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
        universalIdentifiers: WORKFLOW_RUN_THREAD_FIELD_UNIVERSAL_IDENTIFIERS,
      });
    const indexesToCreate =
      getStandardFlatEntitiesToCreateOrThrow<FlatIndexMetadata>({
        standardFlatEntityMaps: standardAllFlatEntityMaps.flatIndexMaps,
        existingFlatEntityMaps: flatIndexMaps,
        universalIdentifiers: WORKFLOW_RUN_THREAD_INDEX_UNIVERSAL_IDENTIFIERS,
      });

    const ownerField =
      flatFieldMetadataMaps.byUniversalIdentifier[
        STANDARD_OBJECTS.agentChatThread.fields.userWorkspaceId
          .universalIdentifier
      ];
    const fieldsToUpdate: FlatFieldMetadata[] =
      isDefined(ownerField) && !ownerField.isNullable
        ? [{ ...ownerField, isNullable: true }]
        : [];

    if (options.dryRun === true) {
      this.logger.log(
        `[DRY RUN] Would create ${fieldsToCreate.length} field(s) and ${indexesToCreate.length} index(es), update ${fieldsToUpdate.length} field(s), then make chat threads inherit readability from their run for workspace ${workspaceId}`,
      );

      return;
    }

    if (
      fieldsToCreate.length + indexesToCreate.length + fieldsToUpdate.length >
      0
    ) {
      await this.runMigration({
        workspaceId,
        applicationUniversalIdentifier:
          twentyStandardFlatApplication.universalIdentifier,
        allFlatEntityOperationByMetadataName: {
          fieldMetadata: {
            flatEntityToCreate: fieldsToCreate,
            flatEntityToDelete: [],
            flatEntityToUpdate: fieldsToUpdate,
          },
          index: {
            flatEntityToCreate: indexesToCreate,
            flatEntityToDelete: [],
            flatEntityToUpdate: [],
          },
        },
      });
    }

    // Readability names the parent field, so it can only change once the
    // field exists.
    const flatObjectMetadatasToUpdate: FlatObjectMetadata[] = [
      {
        ...threadObject,
        readability: MetadataReadability.INHERITED,
        readabilityParentFieldUniversalIdentifiers: [
          STANDARD_OBJECTS.agentChatThread.fields.workflowRun
            .universalIdentifier,
        ],
      },
    ];

    await this.runMigration({
      workspaceId,
      applicationUniversalIdentifier:
        twentyStandardFlatApplication.universalIdentifier,
      allFlatEntityOperationByMetadataName: {
        objectMetadata: {
          flatEntityToCreate: [],
          flatEntityToDelete: [],
          flatEntityToUpdate: flatObjectMetadatasToUpdate,
        },
      },
    });
  }

  async down({ workspaceId }: RunOnWorkspaceArgs): Promise<void> {
    const { flatObjectMetadataMaps } =
      await this.workspaceCacheService.getOrRecompute(workspaceId, [
        'flatObjectMetadataMaps',
      ]);
    const threadObject =
      flatObjectMetadataMaps.byUniversalIdentifier[
        STANDARD_OBJECTS.agentChatThread.universalIdentifier
      ];

    if (!isDefined(threadObject)) {
      return;
    }

    const { twentyStandardFlatApplication } =
      await this.applicationService.findWorkspaceTwentyStandardAndCustomApplicationOrThrow(
        { workspaceId },
      );

    // The run link and its conversations stay: under PRIVATE nobody but a
    // thread's own grantees reads it, and ownerless run threads have none.
    await this.runMigration({
      workspaceId,
      applicationUniversalIdentifier:
        twentyStandardFlatApplication.universalIdentifier,
      allFlatEntityOperationByMetadataName: {
        objectMetadata: {
          flatEntityToCreate: [],
          flatEntityToDelete: [],
          flatEntityToUpdate: [
            {
              ...threadObject,
              readability: MetadataReadability.PRIVATE,
              readabilityParentFieldUniversalIdentifiers: null,
            },
          ],
        },
      },
    });
  }

  private async runMigration(
    args: Omit<
      Parameters<
        WorkspaceMigrationValidateBuildAndRunService['validateBuildAndRunLegacyWorkspaceMigration']
      >[0],
      'isSystemBuild'
    >,
  ): Promise<void> {
    const result =
      await this.workspaceMigrationValidateBuildAndRunService.validateBuildAndRunLegacyWorkspaceMigration(
        { ...args, isSystemBuild: true },
      );

    if (result.status === 'fail') {
      throw new Error(
        `Failed to link chat threads to workflow runs for workspace ${args.workspaceId}: ${JSON.stringify(result, null, 2)}`,
      );
    }
  }
}
