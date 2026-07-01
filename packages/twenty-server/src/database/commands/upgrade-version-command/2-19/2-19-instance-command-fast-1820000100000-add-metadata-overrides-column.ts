import { QueryRunner } from 'typeorm';

import { RegisteredInstanceCommand } from 'src/engine/core-modules/upgrade/decorators/registered-instance-command.decorator';
import { FastInstanceCommand } from 'src/engine/core-modules/upgrade/interfaces/fast-instance-command.interface';

// Phase 1a of unifying the metadata override mechanisms onto one column. Adds the
// "overrides" JSONB column to objectMetadata/fieldMetadata (schema only — the
// backfill from the legacy "standardOverrides" column lives in the paired slow
// command so the bulk write does not hold the ACCESS EXCLUSIVE lock). The legacy
// column is kept (declared on the entity via WasRemovedInUpgrade) and dropped
// only in a follow-up release, so a rolling deploy never breaks the previous
// release's pods, which still SELECT it.
const TABLES = ['objectMetadata', 'fieldMetadata'] as const;

@RegisteredInstanceCommand('2.19.0', 1820000100000)
export class AddMetadataOverridesColumnFastInstanceCommand
  implements FastInstanceCommand
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    for (const table of TABLES) {
      await queryRunner.query(
        `ALTER TABLE "core"."${table}" ADD COLUMN IF NOT EXISTS "overrides" jsonb`,
      );
    }
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    for (const table of TABLES) {
      await queryRunner.query(
        `ALTER TABLE "core"."${table}" DROP COLUMN IF EXISTS "overrides"`,
      );
    }
  }
}
