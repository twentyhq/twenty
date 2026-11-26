import { type DataSource, type QueryRunner } from 'typeorm';

import { RegisteredInstanceCommand } from 'src/engine/core-modules/upgrade/decorators/registered-instance-command.decorator';
import { type SlowInstanceCommand } from 'src/engine/core-modules/upgrade/interfaces/slow-instance-command.interface';

@RegisteredInstanceCommand('2.65.0', 1795709973618, { type: 'slow' })
export class RelaxViewDeletedAtSlowInstanceCommand
  implements SlowInstanceCommand
{
  async runDataMigration(dataSource: DataSource): Promise<void> {
    for (const tableName of [
      'view',
      'viewFilterGroup',
      'viewFilter',
      'viewSort',
      'viewGroup',
      'viewFieldGroup',
      'viewField',
    ]) {
      await dataSource.query(
        `DELETE FROM "core"."${tableName}" WHERE "deletedAt" IS NOT NULL`,
      );
    }
  }

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      'DROP INDEX IF EXISTS "core"."IDX_VIEW_FIELD_FIELD_METADATA_ID_VIEW_ID_UNIQUE"',
    );
    await queryRunner.query(
      'CREATE UNIQUE INDEX "IDX_VIEW_FIELD_FIELD_METADATA_ID_VIEW_ID_UNIQUE" ON "core"."viewField" ("fieldMetadataId", "viewId") WHERE "isCanonical" = true',
    );
    await queryRunner.query(
      'DROP INDEX IF EXISTS "core"."IDX_VIEW_SORT_FIELD_METADATA_ID_VIEW_ID_UNIQUE"',
    );
    await queryRunner.query(
      'CREATE UNIQUE INDEX "IDX_VIEW_SORT_FIELD_METADATA_ID_VIEW_ID_UNIQUE" ON "core"."viewSort" ("fieldMetadataId", "viewId")',
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      'DROP INDEX IF EXISTS "core"."IDX_VIEW_FIELD_FIELD_METADATA_ID_VIEW_ID_UNIQUE"',
    );
    await queryRunner.query(
      'CREATE UNIQUE INDEX "IDX_VIEW_FIELD_FIELD_METADATA_ID_VIEW_ID_UNIQUE" ON "core"."viewField" ("fieldMetadataId", "viewId") WHERE "deletedAt" IS NULL AND "isCanonical" = true',
    );
    await queryRunner.query(
      'DROP INDEX IF EXISTS "core"."IDX_VIEW_SORT_FIELD_METADATA_ID_VIEW_ID_UNIQUE"',
    );
    await queryRunner.query(
      'CREATE UNIQUE INDEX "IDX_VIEW_SORT_FIELD_METADATA_ID_VIEW_ID_UNIQUE" ON "core"."viewSort" ("fieldMetadataId", "viewId") WHERE "deletedAt" IS NULL',
    );
  }
}
