import { Inject } from '@nestjs/common';

import { Command } from 'nest-commander';
import { getSearchFieldUniversalIdentifier } from 'twenty-shared/application';
import { doNotTranslate } from 'twenty-shared/i18n';
import { STANDARD_OBJECTS } from 'twenty-shared/metadata';
import { IndexType } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';

import { ProvisionedWorkspaceCommandRunner } from 'src/database/commands/command-runners/provisioned-workspace.command-runner';
import { WorkspaceIteratorService } from 'src/database/commands/command-runners/workspace-iterator.service';
import { type RunOnWorkspaceArgs } from 'src/database/commands/command-runners/workspace.command-runner';
import { getStandardFlatEntitiesToCreateOrThrow } from 'src/database/commands/upgrade-version-command/2-10/utils/get-standard-flat-entities-to-create-or-throw.util';
import { ApplicationService } from 'src/engine/core-modules/application/application.service';
import { RegisteredWorkspaceCommand } from 'src/engine/core-modules/upgrade/decorators/registered-workspace-command.decorator';
import { type FlatFieldMetadata } from 'src/engine/metadata-modules/flat-field-metadata/types/flat-field-metadata.type';
import { type FlatIndexMetadata } from 'src/engine/metadata-modules/flat-index-metadata/types/flat-index-metadata.type';
import { type FlatSearchFieldMetadata } from 'src/engine/metadata-modules/flat-search-field-metadata/types/flat-search-field-metadata.type';
import { WorkspaceCacheService } from 'src/engine/workspace-cache/services/workspace-cache.service';
import { computeTwentyStandardApplicationAllFlatEntityMaps } from 'src/engine/workspace-manager/twenty-standard-application/utils/twenty-standard-application-all-flat-entity-maps.constant';
import { WorkspaceMigrationBuilderException } from 'src/engine/workspace-manager/workspace-migration/exceptions/workspace-migration-builder-exception';
import { WorkspaceMigrationValidateBuildAndRunService } from 'src/engine/workspace-manager/workspace-migration/services/workspace-migration-validate-build-and-run-service';

const AGENT_CHAT_THREAD = STANDARD_OBJECTS.agentChatThread;

@RegisteredWorkspaceCommand('2.60.0', 1794838104396)
@Command({
  name: 'upgrade:2-60:make-chats-searchable-by-title',
  description: doNotTranslate(
    'Add a title search vector to chats so global search finds them',
  ),
})
export class MakeChatsSearchableByTitleCommand extends ProvisionedWorkspaceCommandRunner {
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

  override async runOnWorkspace({
    workspaceId,
    options,
  }: RunOnWorkspaceArgs): Promise<void> {
    const {
      flatObjectMetadataMaps,
      flatFieldMetadataMaps,
      flatIndexMaps,
      flatSearchFieldMetadataMaps,
    } = await this.workspaceCacheService.getOrRecompute(workspaceId, [
      'flatObjectMetadataMaps',
      'flatFieldMetadataMaps',
      'flatIndexMaps',
      'flatSearchFieldMetadataMaps',
    ]);

    const chatFlatObjectMetadata =
      flatObjectMetadataMaps.byUniversalIdentifier[
        AGENT_CHAT_THREAD.universalIdentifier
      ];
    const titleFlatFieldMetadata =
      flatFieldMetadataMaps.byUniversalIdentifier[
        AGENT_CHAT_THREAD.fields.title.universalIdentifier
      ];

    if (
      !isDefined(chatFlatObjectMetadata) ||
      !isDefined(titleFlatFieldMetadata)
    ) {
      return;
    }

    const titleSearchFieldUniversalIdentifier =
      getSearchFieldUniversalIdentifier({
        applicationUniversalIdentifier:
          chatFlatObjectMetadata.applicationUniversalIdentifier,
        fieldMetadataUniversalIdentifier:
          titleFlatFieldMetadata.universalIdentifier,
      });

    if (
      chatFlatObjectMetadata.isSearchable &&
      isDefined(
        flatSearchFieldMetadataMaps.byUniversalIdentifier[
          titleSearchFieldUniversalIdentifier
        ],
      )
    ) {
      return;
    }

    if (options.dryRun) {
      this.logger.log(
        doNotTranslate(
          `[DRY RUN] Would make chats searchable by title for workspace ${workspaceId}`,
        ),
      );

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

    const searchVectorGinIndexUniversalIdentifiers = Object.values(
      allFlatEntityMaps.flatIndexMaps.byUniversalIdentifier,
    )
      .filter(isDefined)
      .filter(
        (flatIndex) =>
          flatIndex.objectMetadataUniversalIdentifier ===
            AGENT_CHAT_THREAD.universalIdentifier &&
          flatIndex.indexType === IndexType.GIN,
      )
      .map((flatIndex) => flatIndex.universalIdentifier);

    const result =
      await this.workspaceMigrationValidateBuildAndRunService.validateBuildAndRunLegacyWorkspaceMigration(
        {
          shouldDeferActions: false,
          workspaceId,
          isSystemBuild: true,
          applicationUniversalIdentifier:
            twentyStandardFlatApplication.universalIdentifier,
          allFlatEntityOperationByMetadataName: {
            objectMetadata: {
              flatEntityToCreate: [],
              flatEntityToDelete: [],
              flatEntityToUpdate: chatFlatObjectMetadata.isSearchable
                ? []
                : [
                    {
                      ...chatFlatObjectMetadata,
                      isSearchable: true,
                      updatedAt: new Date().toISOString(),
                    },
                  ],
            },
            fieldMetadata: {
              flatEntityToCreate:
                getStandardFlatEntitiesToCreateOrThrow<FlatFieldMetadata>({
                  standardFlatEntityMaps:
                    allFlatEntityMaps.flatFieldMetadataMaps,
                  existingFlatEntityMaps: flatFieldMetadataMaps,
                  universalIdentifiers: [
                    AGENT_CHAT_THREAD.fields.searchVector.universalIdentifier,
                  ],
                }),
              flatEntityToDelete: [],
              flatEntityToUpdate: [],
            },
            searchFieldMetadata: {
              flatEntityToCreate:
                getStandardFlatEntitiesToCreateOrThrow<FlatSearchFieldMetadata>(
                  {
                    standardFlatEntityMaps:
                      allFlatEntityMaps.flatSearchFieldMetadataMaps,
                    existingFlatEntityMaps: flatSearchFieldMetadataMaps,
                    universalIdentifiers: [titleSearchFieldUniversalIdentifier],
                  },
                ),
              flatEntityToDelete: [],
              flatEntityToUpdate: [],
            },
            index: {
              flatEntityToCreate:
                getStandardFlatEntitiesToCreateOrThrow<FlatIndexMetadata>({
                  standardFlatEntityMaps: allFlatEntityMaps.flatIndexMaps,
                  existingFlatEntityMaps: flatIndexMaps,
                  universalIdentifiers:
                    searchVectorGinIndexUniversalIdentifiers,
                }),
              flatEntityToDelete: [],
              flatEntityToUpdate: [],
            },
          },
        },
      );

    if (result.status === 'fail') {
      throw new WorkspaceMigrationBuilderException(
        result,
        doNotTranslate(
          `Failed to make chats searchable by title for workspace ${workspaceId}`,
        ),
      );
    }
  }
}
