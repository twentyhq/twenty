import { QueryRunner } from 'typeorm';

import { RegisteredInstanceCommand } from 'src/engine/core-modules/upgrade/decorators/registered-instance-command.decorator';
import { FastInstanceCommand } from 'src/engine/core-modules/upgrade/interfaces/fast-instance-command.interface';

// Drops the legacy "standardOverrides" column, superseded by "overrides" in
// 2.19. Registered against 2.20.0 so it stays dormant until 2.20 is current
// (the sequence only runs previous + current versions). down() restores it.
const TABLES = ['objectMetadata', 'fieldMetadata'] as const;

@RegisteredInstanceCommand('2.20.0', 1783511477234)
export class DropMetadataStandardOverridesColumnFastInstanceCommand
  implements FastInstanceCommand
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    for (const table of TABLES) {
      await queryRunner.query(
        `ALTER TABLE "core"."${table}" DROP COLUMN IF EXISTS "standardOverrides"`,
      );
    }
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    for (const table of TABLES) {
      await queryRunner.query(
        `ALTER TABLE "core"."${table}" ADD COLUMN IF NOT EXISTS "standardOverrides" jsonb`,
      );
      // Unconditional copy: a WHERE "overrides" IS NOT NULL guard would leave a
      // stale value and resurrect a cleared override.
      await queryRunner.query(
        `UPDATE "core"."${table}" SET "standardOverrides" = "overrides"`,
      );
    }
  }
}
