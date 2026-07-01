import { DataSource, QueryRunner } from 'typeorm';

import { RegisteredInstanceCommand } from 'src/engine/core-modules/upgrade/decorators/registered-instance-command.decorator';
import { SlowInstanceCommand } from 'src/engine/core-modules/upgrade/interfaces/slow-instance-command.interface';

// Phase 1b of unifying the metadata override mechanisms. Backfills the new
// "overrides" column (added by the paired fast command) from the legacy
// "standardOverrides" column, preserving the blob and its per-locale
// translations sub-map. Runs as a data migration so the bulk write is not held
// in the schema-change transaction; it is skipped on fresh installs, which have
// no legacy data to copy. isActive is never written; the active-row count is
// asserted unchanged.
const TABLES = ['objectMetadata', 'fieldMetadata'] as const;

@RegisteredInstanceCommand('2.19.0', 1820000110000, { type: 'slow' })
export class BackfillMetadataOverridesSlowInstanceCommand
  implements SlowInstanceCommand
{
  async runDataMigration(dataSource: DataSource): Promise<void> {
    for (const table of TABLES) {
      const activeCountBefore = await this.getActiveCount(dataSource, table);

      await dataSource.query(
        `UPDATE "core"."${table}" SET "overrides" = "standardOverrides" WHERE "standardOverrides" IS NOT NULL AND "overrides" IS NULL`,
      );

      const activeCountAfter = await this.getActiveCount(dataSource, table);

      if (activeCountBefore !== activeCountAfter) {
        throw new Error(
          `BackfillMetadataOverrides: "isActive" changed on "core"."${table}" (${activeCountBefore} -> ${activeCountAfter}), aborting.`,
        );
      }
    }
  }

  public async up(_queryRunner: QueryRunner): Promise<void> {
    return;
  }

  public async down(_queryRunner: QueryRunner): Promise<void> {
    return;
  }

  private async getActiveCount(
    dataSource: DataSource,
    table: (typeof TABLES)[number],
  ): Promise<number> {
    const [{ count }] = await dataSource.query(
      `SELECT count(*)::int AS count FROM "core"."${table}" WHERE "isActive" = true`,
    );

    return count;
  }
}
