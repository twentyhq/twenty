import { QueryRunner } from 'typeorm';

import { RegisteredInstanceCommand } from 'src/engine/core-modules/upgrade/decorators/registered-instance-command.decorator';
import { FastInstanceCommand } from 'src/engine/core-modules/upgrade/interfaces/fast-instance-command.interface';

// Unifies the two metadata override mechanisms onto one column. The bespoke
// objectMetadata/fieldMetadata "standardOverrides" JSONB column becomes
// "overrides" — the same name every registry-driven overridable entity uses.
// The blob (including the per-locale translations sub-map) is copied verbatim
// before the old column is dropped. Everything runs in up() so a fresh install,
// which skips runDataMigration, still reaches the final schema. The steps are
// idempotent so a retried or partially-applied run converges. isActive is never
// read or written; up() asserts its per-row active count is unchanged.
const TABLES = ['objectMetadata', 'fieldMetadata'] as const;

@RegisteredInstanceCommand('2.19.0', 1820000100000)
export class UnifyMetadataOverridesFastInstanceCommand
  implements FastInstanceCommand
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    for (const table of TABLES) {
      const activeCountBefore = await this.getActiveCount(queryRunner, table);

      await queryRunner.query(
        `ALTER TABLE "core"."${table}" ADD COLUMN IF NOT EXISTS "overrides" jsonb`,
      );

      await queryRunner.query(
        `DO $$
         BEGIN
           IF EXISTS (
             SELECT 1 FROM information_schema.columns
             WHERE table_schema = 'core'
               AND table_name = '${table}'
               AND column_name = 'standardOverrides'
           ) THEN
             UPDATE "core"."${table}"
             SET "overrides" = "standardOverrides"
             WHERE "standardOverrides" IS NOT NULL;

             ALTER TABLE "core"."${table}" DROP COLUMN "standardOverrides";
           END IF;
         END $$`,
      );

      const activeCountAfter = await this.getActiveCount(queryRunner, table);

      if (activeCountBefore !== activeCountAfter) {
        throw new Error(
          `UnifyMetadataOverrides: "isActive" changed on "core"."${table}" (${activeCountBefore} -> ${activeCountAfter}), aborting.`,
        );
      }
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
      await queryRunner.query(
        `ALTER TABLE "core"."${table}" DROP COLUMN IF EXISTS "overrides"`,
      );
    }
  }

  private async getActiveCount(
    queryRunner: QueryRunner,
    table: (typeof TABLES)[number],
  ): Promise<number> {
    const [{ count }] = await queryRunner.query(
      `SELECT count(*)::int AS count FROM "core"."${table}" WHERE "isActive" = true`,
    );

    return count;
  }
}
