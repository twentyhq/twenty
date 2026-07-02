import { QueryRunner } from 'typeorm';

import { RegisteredInstanceCommand } from 'src/engine/core-modules/upgrade/decorators/registered-instance-command.decorator';
import { FastInstanceCommand } from 'src/engine/core-modules/upgrade/interfaces/fast-instance-command.interface';

// Phase 2 of unifying the metadata override mechanisms. Drops the legacy
// "standardOverrides" column now that every pod runs a release which reads and
// writes "overrides" (added in 2.19 fast, backfilled in 2.19 slow).
//
// This command is shipped early — while 2.20.0 is still in TWENTY_NEXT_VERSIONS
// — so the drop is committed, reviewed and tested here instead of living as a
// README to hand-copy later. It stays DORMANT until 2.20 becomes the current
// version: the upgrade sequence only runs commands from
// TWENTY_CROSS_UPGRADE_SUPPORTED_VERSIONS (previous + current), so a 2.20
// command is registered but never executed during the 2.19 rolling deploy —
// which is exactly what keeps the column available for pods still on 2.19.
//
// When `nx version:bump twenty-server` promotes 2.20 to current, this command
// automatically enters the sequence; only then can @WasRemovedInUpgrade be
// added to the "standardOverrides" columns (its validator runs against the
// active sequence and would reject a not-yet-runnable 2.20 step).
//
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
      // Unconditional copy mirrors the 2.19 add-column down(): a
      // WHERE "overrides" IS NOT NULL guard would leave a stale value and
      // resurrect a cleared override.
      await queryRunner.query(
        `UPDATE "core"."${table}" SET "standardOverrides" = "overrides"`,
      );
    }
  }
}
