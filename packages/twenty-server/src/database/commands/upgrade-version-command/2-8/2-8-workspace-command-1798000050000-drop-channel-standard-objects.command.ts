import { Command } from 'nest-commander';

import { ActiveOrSuspendedWorkspaceCommandRunner } from 'src/database/commands/command-runners/active-or-suspended-workspace.command-runner';
import { WorkspaceIteratorService } from 'src/database/commands/command-runners/workspace-iterator.service';
import { type RunOnWorkspaceArgs } from 'src/database/commands/command-runners/workspace.command-runner';
import { ApplicationService } from 'src/engine/core-modules/application/application.service';
import { RegisteredWorkspaceCommand } from 'src/engine/core-modules/upgrade/decorators/registered-workspace-command.decorator';
import { findFlatEntityByUniversalIdentifier } from 'src/engine/metadata-modules/flat-entity/utils/find-flat-entity-by-universal-identifier.util';
import { type FlatObjectMetadata } from 'src/engine/metadata-modules/flat-object-metadata/types/flat-object-metadata.type';
import { WorkspaceCacheService } from 'src/engine/workspace-cache/services/workspace-cache.service';
import { WorkspaceMigrationValidateBuildAndRunService } from 'src/engine/workspace-manager/workspace-migration/services/workspace-migration-validate-build-and-run-service';

const CALENDAR_CHANNEL_OBJECT_UNIVERSAL_IDENTIFIER =
  '20202020-e8f2-40e1-a39c-c0e0039c5034';

const MESSAGE_CHANNEL_OBJECT_UNIVERSAL_IDENTIFIER =
  '20202020-fe8c-40bc-a681-b80b771449b7';

const MESSAGE_FOLDER_OBJECT_UNIVERSAL_IDENTIFIER =
  '20202020-4955-4fd9-8e59-2dbd373f2a46';

const OBJECT_UNIVERSAL_IDENTIFIERS = [
  CALENDAR_CHANNEL_OBJECT_UNIVERSAL_IDENTIFIER,
  MESSAGE_CHANNEL_OBJECT_UNIVERSAL_IDENTIFIER,
  MESSAGE_FOLDER_OBJECT_UNIVERSAL_IDENTIFIER,
];

@RegisteredWorkspaceCommand('2.8.0', 1798000050000)
@Command({
  name: 'upgrade:2-8:drop-channel-standard-objects',
  description:
    'Drop calendarChannel, messageChannel, messageFolder standard objects from workspace schemas (moved to core metadata)',
})
export class DropChannelStandardObjectsCommand extends ActiveOrSuspendedWorkspaceCommandRunner {
  constructor(
    protected readonly workspaceIteratorService: WorkspaceIteratorService,
    private readonly applicationService: ApplicationService,
    private readonly workspaceMigrationValidateBuildAndRunService: WorkspaceMigrationValidateBuildAndRunService,
    private readonly workspaceCacheService: WorkspaceCacheService,
  ) {
    super(workspaceIteratorService);
  }

  override async runOnWorkspace({
    workspaceId,
    options,
  }: RunOnWorkspaceArgs): Promise<void> {
    const isDryRun = options.dryRun ?? false;

    this.logger.log(
      `${isDryRun ? '[DRY RUN] ' : ''}Starting channel standard objects removal for workspace ${workspaceId}`,
    );

    const { flatObjectMetadataMaps } =
      await this.workspaceCacheService.getOrRecompute(workspaceId, [
        'flatObjectMetadataMaps',
      ]);

    const objectsToDelete = OBJECT_UNIVERSAL_IDENTIFIERS.map(
      (universalIdentifier) =>
        findFlatEntityByUniversalIdentifier<FlatObjectMetadata>({
          flatEntityMaps: flatObjectMetadataMaps,
          universalIdentifier,
        }),
    ).filter((object): object is FlatObjectMetadata => object !== undefined);

    if (objectsToDelete.length === 0) {
      this.logger.log(
        `Channel standard objects already absent for workspace ${workspaceId}`,
      );

      return;
    }

    if (isDryRun) {
      this.logger.log(
        `[DRY RUN] Would delete ${objectsToDelete.length} channel standard objects for workspace ${workspaceId}`,
      );

      return;
    }

    const { twentyStandardFlatApplication } =
      await this.applicationService.findWorkspaceTwentyStandardAndCustomApplicationOrThrow(
        { workspaceId },
      );

    const validateAndBuildResult =
      await this.workspaceMigrationValidateBuildAndRunService.validateBuildAndRunWorkspaceMigration(
        {
          isSystemBuild: true,
          allFlatEntityOperationByMetadataName: {
            objectMetadata: {
              flatEntityToCreate: [],
              flatEntityToDelete: objectsToDelete,
              flatEntityToUpdate: [],
            },
          },
          workspaceId,
          applicationUniversalIdentifier:
            twentyStandardFlatApplication.universalIdentifier,
        },
      );

    if (validateAndBuildResult.status === 'fail') {
      this.logger.error(
        `Failed to delete channel standard objects:\n${JSON.stringify(validateAndBuildResult, null, 2)}`,
      );

      throw new Error(
        `Failed to delete channel standard objects for workspace ${workspaceId}`,
      );
    }

    this.logger.log(
      `Deleted ${objectsToDelete.length} channel standard objects for workspace ${workspaceId}`,
    );
  }
}
