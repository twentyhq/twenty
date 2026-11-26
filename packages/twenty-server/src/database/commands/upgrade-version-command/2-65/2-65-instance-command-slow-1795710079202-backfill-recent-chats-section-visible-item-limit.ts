import { type DataSource, type QueryRunner } from 'typeorm';

import { RegisteredInstanceCommand } from 'src/engine/core-modules/upgrade/decorators/registered-instance-command.decorator';
import { type SlowInstanceCommand } from 'src/engine/core-modules/upgrade/interfaces/slow-instance-command.interface';
import { WorkspaceCacheService } from 'src/engine/workspace-cache/services/workspace-cache.service';

@RegisteredInstanceCommand('2.65.0', 1795710079202, { type: 'slow' })
export class BackfillRecentChatsSectionVisibleItemLimitSlowInstanceCommand
  implements SlowInstanceCommand
{
  constructor(private readonly workspaceCacheService: WorkspaceCacheService) {}

  async runDataMigration(dataSource: DataSource): Promise<void> {
    const [updatedRows]: [{ workspaceId: string }[], number] =
      await dataSource.query(
        `UPDATE "core"."navigationMenuItem"
          SET "visibleItemLimit" = 5
          WHERE "builtInSectionKey" = 'aiChatRecents'
            AND "visibleItemLimit" IS NULL
          RETURNING "workspaceId"`,
      );

    for (const workspaceId of new Set(
      updatedRows.map((updatedRow) => updatedRow.workspaceId),
    )) {
      await this.workspaceCacheService.flush(workspaceId, [
        'flatNavigationMenuItemMaps',
      ]);
    }
  }

  public async up(_queryRunner: QueryRunner): Promise<void> {
    return;
  }

  public async down(_queryRunner: QueryRunner): Promise<void> {
    return;
  }
}
