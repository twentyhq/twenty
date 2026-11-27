import { Command } from 'nest-commander';
import { STANDARD_OBJECTS } from 'twenty-shared/metadata';
import { isDefined } from 'twenty-shared/utils';

import { ProvisionedWorkspaceCommandRunner } from 'src/database/commands/command-runners/provisioned-workspace.command-runner';
import { WorkspaceIteratorService } from 'src/database/commands/command-runners/workspace-iterator.service';
import { type RunOnWorkspaceArgs } from 'src/database/commands/command-runners/workspace.command-runner';
import { buildInboxViewToListViewOperations } from 'src/database/commands/upgrade-version-command/2-65/utils/build-inbox-view-to-list-view-operations.util';
import { ApplicationService } from 'src/engine/core-modules/application/application.service';
import { RegisteredWorkspaceCommand } from 'src/engine/core-modules/upgrade/decorators/registered-workspace-command.decorator';
import { findFlatEntityByUniversalIdentifier } from 'src/engine/metadata-modules/flat-entity/utils/find-flat-entity-by-universal-identifier.util';
import { type FlatObjectMetadata } from 'src/engine/metadata-modules/flat-object-metadata/types/flat-object-metadata.type';
import { WorkspaceCacheService } from 'src/engine/workspace-cache/services/workspace-cache.service';
import { computeTwentyStandardApplicationAllFlatEntityMaps } from 'src/engine/workspace-manager/twenty-standard-application/utils/twenty-standard-application-all-flat-entity-maps.constant';
import { WorkspaceMigrationBuilderException } from 'src/engine/workspace-manager/workspace-migration/exceptions/workspace-migration-builder-exception';
import { WorkspaceMigrationValidateBuildAndRunService } from 'src/engine/workspace-manager/workspace-migration/services/workspace-migration-validate-build-and-run-service';

@RegisteredWorkspaceCommand('2.65.0', 1795785302062)
@Command({
  name: 'upgrade:2-65:convert-inbox-views-to-list-views',
  description:
    'Turn existing inbox views into list views and add the view fields they do not have yet',
})
export class ConvertInboxViewsToListViewsCommand extends ProvisionedWorkspaceCommandRunner {
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
    const { flatObjectMetadataMaps, flatViewMaps } =
      await this.workspaceCacheService.getOrRecompute(workspaceId, [
        'flatObjectMetadataMaps',
        'flatViewMaps',
      ]);

    const hasInboxThreadObject = isDefined(
      findFlatEntityByUniversalIdentifier<FlatObjectMetadata>({
        flatEntityMaps: flatObjectMetadataMaps,
        universalIdentifier:
          STANDARD_OBJECTS.agentChatThread.universalIdentifier,
      }),
    );

    if (!hasInboxThreadObject) {
      this.logger.log(
        `Inbox thread object does not exist for workspace ${workspaceId}, skipping`,
      );

      return;
    }

    const { twentyStandardFlatApplication, workspaceCustomFlatApplication } =
      await this.applicationService.findWorkspaceTwentyStandardAndCustomApplicationOrThrow(
        { workspaceId },
      );

    const now = new Date().toISOString();

    const { allFlatEntityMaps: standardAllFlatEntityMaps } =
      computeTwentyStandardApplicationAllFlatEntityMaps({
        now,
        workspaceId,
        twentyStandardApplicationId: twentyStandardFlatApplication.id,
      });

    const inboxViewToListViewOperations = buildInboxViewToListViewOperations({
      flatViews: Object.values(flatViewMaps.byUniversalIdentifier).filter(
        isDefined,
      ),
      standardFlatViewFields: Object.values(
        standardAllFlatEntityMaps.flatViewFieldMaps.byUniversalIdentifier,
      ).filter(isDefined),
      workspaceCustomApplicationUniversalIdentifier:
        workspaceCustomFlatApplication.universalIdentifier,
      now,
    });

    const isDryRun = options.dryRun ?? false;

    for (const {
      writerApplicationUniversalIdentifier,
      viewsToUpdate,
      viewFieldsToCreate,
    } of inboxViewToListViewOperations) {
      this.logger.log(
        `${isDryRun ? '[DRY RUN] ' : ''}Workspace ${workspaceId}: ${viewsToUpdate.length} inbox view(s) to turn into list views and ${viewFieldsToCreate.length} view field(s) to create for application ${writerApplicationUniversalIdentifier}`,
      );

      if (isDryRun) {
        continue;
      }

      const result =
        await this.workspaceMigrationValidateBuildAndRunService.validateBuildAndRunWorkspaceMigration(
          {
            isSystemBuild: true,
            workspaceId,
            applicationUniversalIdentifier:
              writerApplicationUniversalIdentifier,
            allFlatEntityOperationByMetadataName: {
              view: {
                flatEntityToCreate: [],
                flatEntityToDelete: [],
                flatEntityToUpdate: viewsToUpdate,
              },
              viewField: {
                flatEntityToCreate: viewFieldsToCreate,
                flatEntityToDelete: [],
                flatEntityToUpdate: [],
              },
            },
          },
        );

      if (result.status === 'fail') {
        throw new WorkspaceMigrationBuilderException(result);
      }
    }
  }
}
