import { Logger } from '@nestjs/common';

import { DataSource, QueryRunner } from 'typeorm';

import { RegisteredInstanceCommand } from 'src/engine/core-modules/upgrade/decorators/registered-instance-command.decorator';
import { SlowInstanceCommand } from 'src/engine/core-modules/upgrade/interfaces/slow-instance-command.interface';

// Backfills the tsVectorFieldMetadataId FK by pointing every existing
// searchFieldMetadata row at its object's system searchVector (TS_VECTOR) field,
// then enforces NOT NULL. Runs after the fast command that adds the column (and makes
// the FKs deferrable). Rows left without a resolvable searchVector are orphans: they
// index into a TS_VECTOR column that no longer exists (e.g. the object's searchVector
// field was deleted while these rows survived, since their FK only cascades on the
// indexed field). They are dead data, so we delete them rather than abort the upgrade.
@RegisteredInstanceCommand('2.18.0', 1810000003000, { type: 'slow' })
export class BackfillTsVectorFieldMetadataIdOnSearchFieldMetadataSlowInstanceCommand
  implements SlowInstanceCommand
{
  private readonly logger = new Logger(
    BackfillTsVectorFieldMetadataIdOnSearchFieldMetadataSlowInstanceCommand.name,
  );

  async runDataMigration(dataSource: DataSource): Promise<void> {
    await dataSource.query(
      `UPDATE "core"."searchFieldMetadata" "searchFieldMetadata"
       SET "tsVectorFieldMetadataId" = "fieldMetadata"."id"
       FROM "core"."fieldMetadata" "fieldMetadata"
       WHERE "fieldMetadata"."objectMetadataId" = "searchFieldMetadata"."objectMetadataId"
       AND "fieldMetadata"."type" = 'TS_VECTOR'
       AND "fieldMetadata"."name" = 'searchVector'
       AND "searchFieldMetadata"."tsVectorFieldMetadataId" IS NULL`,
    );

    const deletedRows: { count: string }[] = await dataSource.query(
      `WITH "deleted" AS (
         DELETE FROM "core"."searchFieldMetadata"
         WHERE "tsVectorFieldMetadataId" IS NULL
         RETURNING "id"
       )
       SELECT COUNT(*) AS "count" FROM "deleted"`,
    );

    const deletedCount = Number(deletedRows[0]?.count ?? 0);

    if (deletedCount > 0) {
      this.logger.warn(
        `Deleted ${deletedCount} orphaned searchFieldMetadata row(s) referencing an object without a searchVector (TS_VECTOR) field`,
      );
    }
  }

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      'ALTER TABLE "core"."searchFieldMetadata" ALTER COLUMN "tsVectorFieldMetadataId" SET NOT NULL',
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      'ALTER TABLE "core"."searchFieldMetadata" ALTER COLUMN "tsVectorFieldMetadataId" DROP NOT NULL',
    );
  }
}
