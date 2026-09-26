import { Command } from 'nest-commander';
import { isDefined } from 'twenty-shared/utils';

import { ProvisionedWorkspaceCommandRunner } from 'src/database/commands/command-runners/provisioned-workspace.command-runner';
import { WorkspaceIteratorService } from 'src/database/commands/command-runners/workspace-iterator.service';
import { type RunOnWorkspaceArgs } from 'src/database/commands/command-runners/workspace.command-runner';
import { findFieldLessFlatIndexes } from 'src/database/commands/upgrade-version-command/2-43/utils/find-field-less-flat-indexes.util';
import { RegisteredWorkspaceCommand } from 'src/engine/core-modules/upgrade/decorators/registered-workspace-command.decorator';
import { WorkspaceCacheService } from 'src/engine/workspace-cache/services/workspace-cache.service';

@RegisteredWorkspaceCommand('2.43.0', 1790417346000)
@Command({
  name: 'upgrade:2-43:delete-field-less-index-metadata',
  description:
    'Delete indexMetadata rows left without any index field after their fields were deleted, so their name no longer blocks recreating the index',
})
export class DeleteFieldLessIndexMetadataCommand extends ProvisionedWorkspaceCommandRunner {
  constructor(
    protected readonly workspaceIteratorService: WorkspaceIteratorService,
    private readonly workspaceCacheService: WorkspaceCacheService,
  ) {
    super(workspaceIteratorService);
  }

  override async runOnWorkspace({
    workspaceId,
    options,
    dataSource,
  }: RunOnWorkspaceArgs): Promise<void> {
    if (!isDefined(dataSource)) {
      return;
    }

    const { flatIndexMaps } = await this.workspaceCacheService.getOrRecompute(
      workspaceId,
      ['flatIndexMaps'],
    );

    const fieldLessFlatIndexes = findFieldLessFlatIndexes({ flatIndexMaps });

    if (fieldLessFlatIndexes.length === 0) {
      return;
    }

    const fieldLessIndexNames = fieldLessFlatIndexes
      .map(({ name }) => name)
      .join(', ');

    if (options.dryRun) {
      this.logger.log(
        `[DRY RUN] Would delete ${fieldLessFlatIndexes.length} field-less index metadata row(s) (${fieldLessIndexNames}) for workspace ${workspaceId}`,
      );

      return;
    }

    // Metadata rows only: a workspace migration would also DROP INDEX by name,
    // and a physical index can outlive its field rows when a field was
    // re-created on a kept column. Leaving it in place is harmless; index
    // creation reuses it through IF NOT EXISTS.
    const [, deletedCount] = await dataSource.query<[unknown[], number]>(
      `DELETE FROM core."indexMetadata" i
       WHERE i."workspaceId" = $1
         AND i.id = ANY($2::uuid[])
         AND NOT EXISTS (
           SELECT 1 FROM core."indexFieldMetadata" f
           WHERE f."indexMetadataId" = i.id
         )`,
      [workspaceId, fieldLessFlatIndexes.map(({ id }) => id)],
    );

    await this.workspaceCacheService.invalidateAndRecompute(workspaceId, [
      'flatIndexMaps',
      'flatObjectMetadataMaps',
    ]);

    this.logger.log(
      `Deleted ${deletedCount} field-less index metadata row(s) (${fieldLessIndexNames}) for workspace ${workspaceId}`,
    );
  }
}
