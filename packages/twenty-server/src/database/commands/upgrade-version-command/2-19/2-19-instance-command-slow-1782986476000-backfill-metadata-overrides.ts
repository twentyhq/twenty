import { DataSource, QueryRunner } from 'typeorm';

import { RegisteredInstanceCommand } from 'src/engine/core-modules/upgrade/decorators/registered-instance-command.decorator';
import { SlowInstanceCommand } from 'src/engine/core-modules/upgrade/interfaces/slow-instance-command.interface';

const TABLES = ['objectMetadata', 'fieldMetadata'] as const;

@RegisteredInstanceCommand('2.19.0', 1782986476000, { type: 'slow' })
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
