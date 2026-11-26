import { type DataSource, type QueryRunner } from 'typeorm';

import { RegisteredInstanceCommand } from 'src/engine/core-modules/upgrade/decorators/registered-instance-command.decorator';
import { type SlowInstanceCommand } from 'src/engine/core-modules/upgrade/interfaces/slow-instance-command.interface';
import { WorkspaceCacheService } from 'src/engine/workspace-cache/services/workspace-cache.service';

@RegisteredInstanceCommand('2.65.0', 1795701107918, { type: 'slow' })
export class MoveFieldMetadataFormulaOutOfSettingsSlowInstanceCommand
  implements SlowInstanceCommand
{
  constructor(private readonly workspaceCacheService: WorkspaceCacheService) {}

  async runDataMigration(dataSource: DataSource): Promise<void> {
    const [movedRows]: [{ workspaceId: string }[], number] =
      await dataSource.query(
        `UPDATE "core"."fieldMetadata"
          SET "formula" = CASE WHEN jsonb_typeof("settings" -> 'formula') = 'object' THEN "settings" -> 'formula' END,
            "settings" = NULLIF("settings" - 'formula', '{}'::jsonb)
          WHERE "settings" ? 'formula'
          RETURNING "workspaceId"`,
      );

    await this.flushFieldMetadataCaches(movedRows);
  }

  public async up(_queryRunner: QueryRunner): Promise<void> {
    return;
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    const [movedRows]: [{ workspaceId: string }[], number] =
      await queryRunner.query(
        `UPDATE "core"."fieldMetadata"
          SET "settings" = COALESCE("settings", '{}'::jsonb) || jsonb_build_object('formula', "formula"),
            "formula" = NULL
          WHERE "formula" IS NOT NULL
          RETURNING "workspaceId"`,
      );

    await this.flushFieldMetadataCaches(movedRows);
  }

  private async flushFieldMetadataCaches(
    movedRows: { workspaceId: string }[],
  ): Promise<void> {
    for (const workspaceId of new Set(
      movedRows.map((movedRow) => movedRow.workspaceId),
    )) {
      await this.workspaceCacheService.flush(workspaceId, [
        'flatFieldMetadataMaps',
        'flatFieldMetadataMapsOrm',
      ]);
    }
  }
}
