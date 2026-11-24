import { Command } from 'nest-commander';
import { STANDARD_OBJECTS } from 'twenty-shared/metadata';
import { isDefined } from 'twenty-shared/utils';

import { ProvisionedWorkspaceCommandRunner } from 'src/database/commands/command-runners/provisioned-workspace.command-runner';
import { WorkspaceIteratorService } from 'src/database/commands/command-runners/workspace-iterator.service';
import { type RunOnWorkspaceArgs } from 'src/database/commands/command-runners/workspace.command-runner';
import { getStandardFlatEntitiesToCreateOrThrow } from 'src/database/commands/upgrade-version-command/2-10/utils/get-standard-flat-entities-to-create-or-throw.util';
import { ApplicationService } from 'src/engine/core-modules/application/application.service';
import { RegisteredWorkspaceCommand } from 'src/engine/core-modules/upgrade/decorators/registered-workspace-command.decorator';
import { findFlatEntityByUniversalIdentifier } from 'src/engine/metadata-modules/flat-entity/utils/find-flat-entity-by-universal-identifier.util';
import { type FlatObjectMetadata } from 'src/engine/metadata-modules/flat-object-metadata/types/flat-object-metadata.type';
import { type FlatViewFilter } from 'src/engine/metadata-modules/flat-view-filter/types/flat-view-filter.type';
import { type FlatView } from 'src/engine/metadata-modules/flat-view/types/flat-view.type';
import { WorkspaceCacheService } from 'src/engine/workspace-cache/services/workspace-cache.service';
import { computeTwentyStandardApplicationAllFlatEntityMaps } from 'src/engine/workspace-manager/twenty-standard-application/utils/twenty-standard-application-all-flat-entity-maps.constant';
import { WorkspaceMigrationBuilderException } from 'src/engine/workspace-manager/workspace-migration/exceptions/workspace-migration-builder-exception';
import { WorkspaceMigrationValidateBuildAndRunService } from 'src/engine/workspace-manager/workspace-migration/services/workspace-migration-validate-build-and-run-service';

const INBOX_THREAD = STANDARD_OBJECTS.agentChatThread;

const INBOX_VIEW_UNIVERSAL_IDENTIFIERS = Object.values(INBOX_THREAD.views).map(
  (view) => view.universalIdentifier,
);

const INBOX_VIEW_FILTER_UNIVERSAL_IDENTIFIERS = [
  INBOX_THREAD.views.needsInput.viewFilters.pendingQuestionMessageIdIsNotEmpty
    .universalIdentifier,
  INBOX_THREAD.views.assignedToMe.viewFilters.assigneeIsMe.universalIdentifier,
];

@RegisteredWorkspaceCommand('2.63.0', 1795526879491)
@Command({
  name: 'upgrade:2-63:add-standard-inbox-views',
  description:
    'Add the standard inbox views of chats and their saved filters in existing workspaces',
})
export class AddStandardInboxViewsCommand extends ProvisionedWorkspaceCommandRunner {
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
    const { flatObjectMetadataMaps, flatViewMaps, flatViewFilterMaps } =
      await this.workspaceCacheService.getOrRecompute(workspaceId, [
        'flatObjectMetadataMaps',
        'flatViewMaps',
        'flatViewFilterMaps',
      ]);

    const hasChatObject = isDefined(
      findFlatEntityByUniversalIdentifier<FlatObjectMetadata>({
        flatEntityMaps: flatObjectMetadataMaps,
        universalIdentifier: INBOX_THREAD.universalIdentifier,
      }),
    );

    if (!hasChatObject) {
      this.logger.log(
        `Chat object does not exist for workspace ${workspaceId}, skipping`,
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

    const viewsToCreate = getStandardFlatEntitiesToCreateOrThrow<FlatView>({
      standardFlatEntityMaps: standardAllFlatEntityMaps.flatViewMaps,
      existingFlatEntityMaps: flatViewMaps,
      universalIdentifiers: INBOX_VIEW_UNIVERSAL_IDENTIFIERS,
    });

    const viewFiltersToCreate =
      getStandardFlatEntitiesToCreateOrThrow<FlatViewFilter>({
        standardFlatEntityMaps: standardAllFlatEntityMaps.flatViewFilterMaps,
        existingFlatEntityMaps: flatViewFilterMaps,
        universalIdentifiers: INBOX_VIEW_FILTER_UNIVERSAL_IDENTIFIERS,
      });

    if (viewsToCreate.length === 0 && viewFiltersToCreate.length === 0) {
      return;
    }

    if (options.dryRun ?? false) {
      this.logger.log(
        `[DRY RUN] Workspace ${workspaceId}: ${viewsToCreate.length} inbox view(s) and ${viewFiltersToCreate.length} inbox view filter(s) to create`,
      );

      return;
    }

    const result =
      await this.workspaceMigrationValidateBuildAndRunService.validateBuildAndRunLegacyWorkspaceMigration(
        {
          shouldDeferActions: false,
          isSystemBuild: true,
          workspaceId,
          applicationUniversalIdentifier:
            twentyStandardFlatApplication.universalIdentifier,
          allFlatEntityOperationByMetadataName: {
            view: {
              flatEntityToCreate: viewsToCreate,
              flatEntityToDelete: [],
              flatEntityToUpdate: [],
            },
            viewFilter: {
              flatEntityToCreate: viewFiltersToCreate,
              flatEntityToDelete: [],
              flatEntityToUpdate: [],
            },
          },
        },
      );

    if (result.status === 'fail') {
      throw new WorkspaceMigrationBuilderException(
        result,
        `Failed to add the standard inbox views for workspace ${workspaceId}`,
      );
    }
  }
}
