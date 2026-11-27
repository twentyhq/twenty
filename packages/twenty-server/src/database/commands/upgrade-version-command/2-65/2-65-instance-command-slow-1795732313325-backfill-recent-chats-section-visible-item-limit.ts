import { type DataSource, type QueryRunner } from 'typeorm';

import { RegisteredInstanceCommand } from 'src/engine/core-modules/upgrade/decorators/registered-instance-command.decorator';
import { type SlowInstanceCommand } from 'src/engine/core-modules/upgrade/interfaces/slow-instance-command.interface';
import { WorkspaceCacheService } from 'src/engine/workspace-cache/services/workspace-cache.service';

@RegisteredInstanceCommand('2.65.0', 1795732313325, { type: 'slow' })
export class BackfillRecentChatsSectionVisibleItemLimitSlowInstanceCommand
  implements SlowInstanceCommand
{
  constructor(private readonly workspaceCacheService: WorkspaceCacheService) {}

  async runDataMigration(dataSource: DataSource): Promise<void> {
    await dataSource.query(
      `UPDATE "core"."navigationMenuItem"
        SET "visibleItemLimit" = 5
        WHERE "builtInSectionKey" = 'aiChatRecents'
          AND "visibleItemLimit" IS NULL`,
    );

    const recentChatsSectionRows: { workspaceId: string }[] =
      await dataSource.query(
        `SELECT DISTINCT "workspaceId"
          FROM "core"."navigationMenuItem"
          WHERE "builtInSectionKey" = 'aiChatRecents'`,
      );

    for (const { workspaceId } of recentChatsSectionRows) {
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
