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
import { findFlatEntityByUniversalIdentifier } from 'src/engine/metadata-modules/flat-entity/utils/find-flat-entity-by-universal-identifier.util';
import { type FlatFieldMetadata } from 'src/engine/metadata-modules/flat-field-metadata/types/flat-field-metadata.type';
import { type FlatIndexMetadata } from 'src/engine/metadata-modules/flat-index-metadata/types/flat-index-metadata.type';
import { type FlatObjectMetadata } from 'src/engine/metadata-modules/flat-object-metadata/types/flat-object-metadata.type';
import { WorkspaceCacheService } from 'src/engine/workspace-cache/services/workspace-cache.service';
import { computeTwentyStandardApplicationAllFlatEntityMaps } from 'src/engine/workspace-manager/twenty-standard-application/utils/twenty-standard-application-all-flat-entity-maps.constant';
import { WorkspaceMigrationBuilderException } from 'src/engine/workspace-manager/workspace-migration/exceptions/workspace-migration-builder-exception';
import { WorkspaceMigrationValidateBuildAndRunService } from 'src/engine/workspace-manager/workspace-migration/services/workspace-migration-validate-build-and-run-service';

const CHANNEL_OBJECT_UNIVERSAL_IDENTIFIERS = [
  STANDARD_OBJECTS.agentChatChannel.universalIdentifier,
  STANDARD_OBJECTS.agentChatChannelMember.universalIdentifier,
];

const THREAD_CHANNEL_FIELD_UNIVERSAL_IDENTIFIER =
  STANDARD_OBJECTS.agentChatThread.fields.channel.universalIdentifier;

// Fields this change adds to objects that already exist
const EXISTING_OBJECT_FIELD_UNIVERSAL_IDENTIFIERS = [
  THREAD_CHANNEL_FIELD_UNIVERSAL_IDENTIFIER,
  STANDARD_OBJECTS.agentChatThread.fields.channelArchivedAt.universalIdentifier,
  STANDARD_OBJECTS.agentChatThread.fields.channelSnoozedUntil
    .universalIdentifier,
  STANDARD_OBJECTS.workspaceMember.fields.agentChatChannelMemberships
    .universalIdentifier,
];

const INDEX_UNIVERSAL_IDENTIFIERS = [
  STANDARD_OBJECTS.agentChatThread.indexes.channelLastActivityIndex
    .universalIdentifier,
  ...Object.values(STANDARD_OBJECTS.agentChatChannelMember.indexes).map(
    (index) => index.universalIdentifier,
  ),
];

@RegisteredWorkspaceCommand('2.46.0', 1791386511131)
@Command({
  name: 'upgrade:2-46:add-agent-chat-channels',
  description:
    'Create chat channels and their members, and make chat threads read through their channel',
})
export class AddAgentChatChannelsCommand extends ProvisionedWorkspaceCommandRunner {
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

    // Workspaces without chat history objects get channels when the 2.42
    // history move provisions them
    if (
      !isDefined(
        flatObjectMetadataMaps.byUniversalIdentifier[
          STANDARD_OBJECTS.agentChatThread.universalIdentifier
        ],
      )
    ) {
      this.logger.log(
        `agentChatThread object not found for workspace ${workspaceId}, skipping`,
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

    const objectsToCreate =
      getStandardFlatEntitiesToCreateOrThrow<FlatObjectMetadata>({
        standardFlatEntityMaps:
          standardAllFlatEntityMaps.flatObjectMetadataMaps,
        existingFlatEntityMaps: flatObjectMetadataMaps,
        universalIdentifiers: CHANNEL_OBJECT_UNIVERSAL_IDENTIFIERS,
      });
    const fieldsToCreate =
      getStandardFlatEntitiesToCreateOrThrow<FlatFieldMetadata>({
        standardFlatEntityMaps: standardAllFlatEntityMaps.flatFieldMetadataMaps,
        existingFlatEntityMaps: flatFieldMetadataMaps,
        universalIdentifiers: [
          ...Object.values(STANDARD_OBJECTS.agentChatChannel.fields).map(
            (field) => field.universalIdentifier,
          ),
          ...Object.values(STANDARD_OBJECTS.agentChatChannelMember.fields).map(
            (field) => field.universalIdentifier,
          ),
          ...EXISTING_OBJECT_FIELD_UNIVERSAL_IDENTIFIERS,
        ],
      });
    const indexesToCreate =
      getStandardFlatEntitiesToCreateOrThrow<FlatIndexMetadata>({
        standardFlatEntityMaps: standardAllFlatEntityMaps.flatIndexMaps,
        existingFlatEntityMaps: flatIndexMaps,
        universalIdentifiers: INDEX_UNIVERSAL_IDENTIFIERS,
      });

    const threadObject =
      flatObjectMetadataMaps.byUniversalIdentifier[
        STANDARD_OBJECTS.agentChatThread.universalIdentifier
      ];
    const isThreadReadThroughChannel =
      threadObject?.readability === MetadataReadability.INHERITED &&
      threadObject.readabilityParentFieldUniversalIdentifiers?.includes(
        THREAD_CHANNEL_FIELD_UNIVERSAL_IDENTIFIER,
      ) === true;

    const operationCount =
      objectsToCreate.length + fieldsToCreate.length + indexesToCreate.length;

    if (operationCount === 0 && isThreadReadThroughChannel) {
      return;
    }

    this.logger.log(
      `${options.dryRun ? '[DRY RUN] ' : ''}Workspace ${workspaceId}: creating ${objectsToCreate.length} object(s), ${fieldsToCreate.length} field(s) and ${indexesToCreate.length} index(es) for chat channels${isThreadReadThroughChannel ? '' : ', then reading chat threads through their channel'}`,
    );

    if (options.dryRun ?? false) {
      return;
    }

    if (operationCount > 0) {
      await this.runMigration({
        workspaceId,
        applicationUniversalIdentifier:
          twentyStandardFlatApplication.universalIdentifier,
        allFlatEntityOperationByMetadataName: {
          objectMetadata: {
            flatEntityToCreate: objectsToCreate,
            flatEntityToDelete: [],
            flatEntityToUpdate: [],
          },
          fieldMetadata: {
            flatEntityToCreate: fieldsToCreate,
            flatEntityToDelete: [],
            flatEntityToUpdate: [],
          },
          index: {
            flatEntityToCreate: indexesToCreate,
            flatEntityToDelete: [],
            flatEntityToUpdate: [],
          },
        },
      });
    }

    if (isThreadReadThroughChannel || !isDefined(threadObject)) {
      return;
    }

    // Readability names the parent field, so it can only change once the
    // field exists. A thread with no channel has no parent, so it keeps
    // reading through its own grants as it did under PRIVATE.
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
              readability: MetadataReadability.INHERITED,
              readabilityParentFieldUniversalIdentifiers: [
                THREAD_CHANNEL_FIELD_UNIVERSAL_IDENTIFIER,
              ],
            },
          ],
        },
      },
    });
  }

  async down({ workspaceId, options }: RunOnWorkspaceArgs): Promise<void> {
    const {
      flatObjectMetadataMaps,
      flatFieldMetadataMaps,
      flatIndexMaps,
    } = await this.workspaceCacheService.getOrRecompute(workspaceId, [
      'flatObjectMetadataMaps',
      'flatFieldMetadataMaps',
      'flatIndexMaps',
    ]);

    const threadObject =
      flatObjectMetadataMaps.byUniversalIdentifier[
        STANDARD_OBJECTS.agentChatThread.universalIdentifier
      ];
    const objectsToDelete = CHANNEL_OBJECT_UNIVERSAL_IDENTIFIERS.map(
      (universalIdentifier) =>
        findFlatEntityByUniversalIdentifier<FlatObjectMetadata>({
          flatEntityMaps: flatObjectMetadataMaps,
          universalIdentifier,
        }),
    ).filter(isDefined);
    const fieldsToDelete = EXISTING_OBJECT_FIELD_UNIVERSAL_IDENTIFIERS.map(
      (universalIdentifier) =>
        findFlatEntityByUniversalIdentifier<FlatFieldMetadata>({
          flatEntityMaps: flatFieldMetadataMaps,
          universalIdentifier,
        }),
    ).filter(isDefined);
    const indexesToDelete = INDEX_UNIVERSAL_IDENTIFIERS.map(
      (universalIdentifier) =>
        findFlatEntityByUniversalIdentifier<FlatIndexMetadata>({
          flatEntityMaps: flatIndexMaps,
          universalIdentifier,
        }),
    ).filter(isDefined);

    if (
      objectsToDelete.length +
        fieldsToDelete.length +
        indexesToDelete.length ===
        0 &&
      threadObject?.readability !== MetadataReadability.INHERITED
    ) {
      return;
    }

    this.logger.log(
      `${options.dryRun ? '[DRY RUN] ' : ''}Workspace ${workspaceId}: reading chat threads through their own grants, then deleting ${objectsToDelete.length} object(s), ${fieldsToDelete.length} field(s) and ${indexesToDelete.length} index(es) of chat channels`,
    );

    if (options.dryRun ?? false) {
      return;
    }

    const { twentyStandardFlatApplication } =
      await this.applicationService.findWorkspaceTwentyStandardAndCustomApplicationOrThrow(
        { workspaceId },
      );

    // The parent field can only go once readability no longer names it
    if (
      isDefined(threadObject) &&
      threadObject.readability === MetadataReadability.INHERITED
    ) {
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

    await this.runMigration({
      workspaceId,
      applicationUniversalIdentifier:
        twentyStandardFlatApplication.universalIdentifier,
      allFlatEntityOperationByMetadataName: {
        objectMetadata: {
          flatEntityToCreate: [],
          flatEntityToDelete: objectsToDelete,
          flatEntityToUpdate: [],
        },
        fieldMetadata: {
          flatEntityToCreate: [],
          flatEntityToDelete: fieldsToDelete,
          flatEntityToUpdate: [],
        },
        index: {
          flatEntityToCreate: [],
          flatEntityToDelete: indexesToDelete,
          flatEntityToUpdate: [],
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
      throw new WorkspaceMigrationBuilderException(
        result,
        `Failed to change chat channels for workspace ${args.workspaceId}`,
      );
    }
  }
}
