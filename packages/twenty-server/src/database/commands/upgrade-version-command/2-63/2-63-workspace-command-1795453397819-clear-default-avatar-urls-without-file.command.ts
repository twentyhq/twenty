import { InjectDataSource } from '@nestjs/typeorm';
import { Command } from 'nest-commander';
import { isNonEmptyArray } from 'twenty-shared/utils';
import { DataSource } from 'typeorm';

import { ProvisionedWorkspaceCommandRunner } from 'src/database/commands/command-runners/provisioned-workspace.command-runner';
import { WorkspaceIteratorService } from 'src/database/commands/command-runners/workspace-iterator.service';
import { type RunOnWorkspaceArgs } from 'src/database/commands/command-runners/workspace.command-runner';
import { CoreEntityCacheService } from 'src/engine/core-entity-cache/services/core-entity-cache.service';
import { RegisteredWorkspaceCommand } from 'src/engine/core-modules/upgrade/decorators/registered-workspace-command.decorator';

const CORE_PICTURE_FILE_ID_PATTERN =
  '^[a-z]+://[^/]+/file/core-picture/([0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12})(?:[/?#]|$)';

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
    const staleUserWorkspaces: { id: string }[] = await this.dataSource.query(
      `SELECT "userWorkspace"."id"
       FROM "core"."userWorkspace" "userWorkspace"
       CROSS JOIN LATERAL (
         SELECT substring("userWorkspace"."defaultAvatarUrl" from $2)::uuid AS "fileId"
       ) "parsed"
       WHERE "userWorkspace"."workspaceId" = $1
         AND "parsed"."fileId" IS NOT NULL
         AND NOT EXISTS (
           SELECT 1
           FROM "core"."file" "file"
           WHERE "file"."id" = "parsed"."fileId"
             AND "file"."workspaceId" = "userWorkspace"."workspaceId"
             AND "file"."path" LIKE 'core-picture/%'
             AND "file"."deletedAt" IS NULL
         )`,
      [workspaceId, CORE_PICTURE_FILE_ID_PATTERN],
    );

    const staleUserWorkspaceIds = staleUserWorkspaces.map(({ id }) => id);

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
