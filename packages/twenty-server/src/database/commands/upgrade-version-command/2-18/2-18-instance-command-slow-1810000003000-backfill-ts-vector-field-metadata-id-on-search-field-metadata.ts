import { DataSource, QueryRunner } from 'typeorm';

import { RegisteredInstanceCommand } from 'src/engine/core-modules/upgrade/decorators/registered-instance-command.decorator';
import { SlowInstanceCommand } from 'src/engine/core-modules/upgrade/interfaces/slow-instance-command.interface';

// Backfills the tsVectorFieldMetadataId FK by pointing every existing
// searchFieldMetadata row at its object's system searchVector (TS_VECTOR) field,
// then enforces NOT NULL. Runs after the fast command that adds the column and the
// one that makes its FK deferrable. Any row left without a resolvable searchVector
// aborts the upgrade rather than silently relaxing the NOT NULL guarantee.
@RegisteredInstanceCommand('2.18.0', 1810000003000, { type: 'slow' })
export class BackfillTsVectorFieldMetadataIdOnSearchFieldMetadataSlowInstanceCommand
  implements SlowInstanceCommand
{
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

    const unresolvedRows: { count: string }[] = await dataSource.query(
      `SELECT COUNT(*) AS "count" FROM "core"."searchFieldMetadata"
       WHERE "tsVectorFieldMetadataId" IS NULL`,
    );

    const unresolvedCount = Number(unresolvedRows[0]?.count ?? 0);

    if (unresolvedCount > 0) {
      throw new Error(
        `Cannot enforce searchFieldMetadata.tsVectorFieldMetadataId NOT NULL: ${unresolvedCount} row(s) reference an object without a searchVector (TS_VECTOR) field`,
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
