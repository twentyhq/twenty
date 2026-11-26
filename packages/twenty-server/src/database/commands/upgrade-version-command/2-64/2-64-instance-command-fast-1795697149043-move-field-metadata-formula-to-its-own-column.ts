import { QueryRunner } from 'typeorm';

import { RegisteredInstanceCommand } from 'src/engine/core-modules/upgrade/decorators/registered-instance-command.decorator';
import { FastInstanceCommand } from 'src/engine/core-modules/upgrade/interfaces/fast-instance-command.interface';
import { WorkspaceCacheService } from 'src/engine/workspace-cache/services/workspace-cache.service';

// Formula readers move to the column in the same release, so the formulas cannot wait for a slow command
@RegisteredInstanceCommand('2.64.0', 1795697149043)
export class MoveFieldMetadataFormulaToItsOwnColumnFastInstanceCommand implements FastInstanceCommand {
  constructor(private readonly workspaceCacheService: WorkspaceCacheService) {}

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      'ALTER TABLE "core"."fieldMetadata" ADD "formula" jsonb',
    );

    const movedRows: { workspaceId: string }[] = await queryRunner.query(
      `UPDATE "core"."fieldMetadata"
        SET "formula" = CASE WHEN jsonb_typeof("settings" -> 'formula') = 'object' THEN "settings" -> 'formula' END,
          "settings" = NULLIF("settings" - 'formula', '{}'::jsonb)
        WHERE "settings" ? 'formula'
        RETURNING "workspaceId"`,
    );

    await this.flushFieldMetadataCaches(movedRows);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    const movedRows: { workspaceId: string }[] = await queryRunner.query(
      `UPDATE "core"."fieldMetadata"
        SET "settings" = COALESCE("settings", '{}'::jsonb) || jsonb_build_object('formula', "formula")
        WHERE "formula" IS NOT NULL
        RETURNING "workspaceId"`,
    );

    await queryRunner.query(
      'ALTER TABLE "core"."fieldMetadata" DROP COLUMN "formula"',
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
