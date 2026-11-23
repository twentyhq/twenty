import { InjectDataSource } from '@nestjs/typeorm';
import { Command } from 'nest-commander';
import { FileFolder } from 'twenty-shared/types';
import { isDefined, isNonEmptyArray } from 'twenty-shared/utils';
import { DataSource } from 'typeorm';

import { ProvisionedWorkspaceCommandRunner } from 'src/database/commands/command-runners/provisioned-workspace.command-runner';
import { WorkspaceIteratorService } from 'src/database/commands/command-runners/workspace-iterator.service';
import { type RunOnWorkspaceArgs } from 'src/database/commands/command-runners/workspace.command-runner';
import { CoreEntityCacheService } from 'src/engine/core-entity-cache/services/core-entity-cache.service';
import { extractFileIdFromUrl } from 'src/engine/core-modules/file/files-field/utils/extract-file-id-from-url.util';
import { RegisteredWorkspaceCommand } from 'src/engine/core-modules/upgrade/decorators/registered-workspace-command.decorator';

@RegisteredWorkspaceCommand('2.63.0', 1795453397819)
@Command({
  name: 'upgrade:2-63:clear-default-avatar-urls-without-file',
  description:
    'Clear userWorkspace default avatar URLs that point to a core picture file that no longer exists',
})
export class ClearDefaultAvatarUrlsWithoutFileCommand extends ProvisionedWorkspaceCommandRunner {
  constructor(
    protected readonly workspaceIteratorService: WorkspaceIteratorService,
    private readonly coreEntityCacheService: CoreEntityCacheService,
    @InjectDataSource() private readonly dataSource: DataSource,
  ) {
    super(workspaceIteratorService);
  }

  override async runOnWorkspace({
    workspaceId,
    options,
  }: RunOnWorkspaceArgs): Promise<void> {
    const userWorkspaces: { id: string; defaultAvatarUrl: string }[] =
      await this.dataSource.query(
        `SELECT "id", "defaultAvatarUrl" FROM "core"."userWorkspace"
         WHERE "workspaceId" = $1 AND "defaultAvatarUrl" IS NOT NULL`,
        [workspaceId],
      );

    const avatarFiles = userWorkspaces.flatMap(({ id, defaultAvatarUrl }) => {
      const fileId = extractFileIdFromUrl(
        defaultAvatarUrl,
        FileFolder.CorePicture,
      );

      return isDefined(fileId) ? [{ userWorkspaceId: id, fileId }] : [];
    });

    if (!isNonEmptyArray(avatarFiles)) {
      return;
    }

    const existingFiles: { id: string }[] = await this.dataSource.query(
      `SELECT "id" FROM "core"."file"
       WHERE "workspaceId" = $1
         AND "id" = ANY($2::uuid[])
         AND "path" LIKE 'core-picture/%'
         AND "deletedAt" IS NULL`,
      [workspaceId, avatarFiles.map(({ fileId }) => fileId)],
    );

    const existingFileIds = new Set(existingFiles.map(({ id }) => id));

    const staleUserWorkspaceIds = avatarFiles
      .filter(({ fileId }) => !existingFileIds.has(fileId))
      .map(({ userWorkspaceId }) => userWorkspaceId);

    if (!isNonEmptyArray(staleUserWorkspaceIds)) {
      return;
    }

    this.logger.log(
      `${options.dryRun ? '[DRY RUN] Would clear' : 'Clearing'} ${staleUserWorkspaceIds.length} default avatar URL(s) without file in workspace ${workspaceId}`,
    );

    if (options.dryRun) {
      return;
    }

    await this.dataSource.query(
      `UPDATE "core"."userWorkspace"
       SET "defaultAvatarUrl" = NULL
       WHERE "id" = ANY($1::uuid[])`,
      [staleUserWorkspaceIds],
    );

    for (const userWorkspaceId of staleUserWorkspaceIds) {
      await this.coreEntityCacheService.invalidate(
        'userWorkspaceEntity',
        userWorkspaceId,
      );
    }
  }
}
