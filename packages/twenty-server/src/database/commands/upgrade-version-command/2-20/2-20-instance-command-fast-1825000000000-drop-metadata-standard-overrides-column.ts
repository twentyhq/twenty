import { QueryRunner } from 'typeorm';

import { RegisteredInstanceCommand } from 'src/engine/core-modules/upgrade/decorators/registered-instance-command.decorator';
import { FastInstanceCommand } from 'src/engine/core-modules/upgrade/interfaces/fast-instance-command.interface';

// Phase 2 of unifying the metadata override mechanisms. Drops the legacy
// "standardOverrides" column now that every pod runs a release which reads and
// writes "overrides" (backfilled in 2.19). Runs only once the instance reaches
// 2.20, so the 2.19 rolling deploy keeps the column available for older pods.
// down() restores the column and copies the blob back from "overrides".
const TABLES = ['objectMetadata', 'fieldMetadata'] as const;

@RegisteredInstanceCommand('2.20.0', 1825000000000)
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
      await queryRunner.query(
        `UPDATE "core"."${table}" SET "standardOverrides" = "overrides" WHERE "overrides" IS NOT NULL`,
      );
    }
  }
}
