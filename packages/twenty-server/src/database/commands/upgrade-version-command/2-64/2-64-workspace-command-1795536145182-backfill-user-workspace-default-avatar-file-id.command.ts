import { InjectDataSource } from '@nestjs/typeorm';
import { Command } from 'nest-commander';
import { FileFolder } from 'twenty-shared/types';
import { isDefined, isNonEmptyArray } from 'twenty-shared/utils';
import { DataSource } from 'typeorm';

import { ProvisionedWorkspaceCommandRunner } from 'src/database/commands/command-runners/provisioned-workspace.command-runner';
import { WorkspaceIteratorService } from 'src/database/commands/command-runners/workspace-iterator.service';
import { type RunOnWorkspaceArgs } from 'src/database/commands/command-runners/workspace.command-runner';
import { extractFileIdFromUrl } from 'src/engine/core-modules/file/files-field/utils/extract-file-id-from-url.util';
import { RegisteredWorkspaceCommand } from 'src/engine/core-modules/upgrade/decorators/registered-workspace-command.decorator';

@RegisteredWorkspaceCommand('2.64.0', 1795536145182)
@Command({
  name: 'upgrade:2-64:backfill-user-workspace-default-avatar-file-id',
  description:
    'Backfill userWorkspace.defaultAvatarFileId from defaultAvatarUrl, skipping URLs whose core picture file no longer exists',
})
export class BackfillUserWorkspaceDefaultAvatarFileIdCommand extends ProvisionedWorkspaceCommandRunner {
  constructor(
    protected readonly workspaceIteratorService: WorkspaceIteratorService,
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
         WHERE "workspaceId" = $1
           AND "defaultAvatarUrl" IS NOT NULL
           AND "defaultAvatarFileId" IS NULL`,
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

    const avatarFilesToBackfill = avatarFiles.filter(({ fileId }) =>
      existingFileIds.has(fileId),
    );

    this.logger.log(
      `${options.dryRun ? '[DRY RUN] Would backfill' : 'Backfilling'} ${avatarFilesToBackfill.length} default avatar file id(s) in workspace ${workspaceId}, ${avatarFiles.length - avatarFilesToBackfill.length} pointing to a missing file`,
    );

    if (options.dryRun || !isNonEmptyArray(avatarFilesToBackfill)) {
      return;
    }

    await this.dataSource.query(
      `UPDATE "core"."userWorkspace" AS "userWorkspace"
       SET "defaultAvatarFileId" = "backfill"."fileId"
       FROM unnest($1::uuid[], $2::uuid[]) AS "backfill"("userWorkspaceId", "fileId")
       WHERE "userWorkspace"."id" = "backfill"."userWorkspaceId"`,
      [
        avatarFilesToBackfill.map(({ userWorkspaceId }) => userWorkspaceId),
        avatarFilesToBackfill.map(({ fileId }) => fileId),
      ],
    );
  }
}
