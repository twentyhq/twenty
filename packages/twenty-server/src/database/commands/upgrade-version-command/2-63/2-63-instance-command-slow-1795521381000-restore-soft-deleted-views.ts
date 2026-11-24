import { type DataSource, type QueryRunner } from 'typeorm';

import { RegisteredInstanceCommand } from 'src/engine/core-modules/upgrade/decorators/registered-instance-command.decorator';
import { type SlowInstanceCommand } from 'src/engine/core-modules/upgrade/interfaces/slow-instance-command.interface';

const VIEW_TABLE_NAMES = [
  'view',
  'viewField',
  'viewFieldGroup',
  'viewFilter',
  'viewFilterGroup',
  'viewGroup',
  'viewSort',
];

@RegisteredInstanceCommand('2.63.0', 1795521381000, { type: 'slow' })
export class RestoreSoftDeletedViewsSlowInstanceCommand
  implements SlowInstanceCommand
{
  async runDataMigration(dataSource: DataSource): Promise<void> {
    await dataSource.query(
      `DELETE FROM "core"."viewField" "viewField"
       WHERE "viewField"."deletedAt" IS NOT NULL
         AND "viewField"."isCanonical" = true
         AND EXISTS (
           SELECT 1 FROM "core"."viewField" "otherViewField"
           WHERE "otherViewField"."viewId" = "viewField"."viewId"
             AND "otherViewField"."fieldMetadataId" = "viewField"."fieldMetadataId"
             AND "otherViewField"."isCanonical" = true
             AND "otherViewField"."id" <> "viewField"."id"
             AND ("otherViewField"."deletedAt" IS NULL OR "otherViewField"."id" < "viewField"."id")
         )`,
    );

    await dataSource.query(
      `DELETE FROM "core"."viewSort" "viewSort"
       WHERE "viewSort"."deletedAt" IS NOT NULL
         AND EXISTS (
           SELECT 1 FROM "core"."viewSort" "otherViewSort"
           WHERE "otherViewSort"."viewId" = "viewSort"."viewId"
             AND "otherViewSort"."fieldMetadataId" = "viewSort"."fieldMetadataId"
             AND "otherViewSort"."id" <> "viewSort"."id"
             AND ("otherViewSort"."deletedAt" IS NULL OR "otherViewSort"."id" < "viewSort"."id")
         )`,
    );

    for (const tableName of VIEW_TABLE_NAMES) {
      await dataSource.query(
        `UPDATE "core"."${tableName}" SET "deletedAt" = NULL WHERE "deletedAt" IS NOT NULL`,
      );
    }
  }

  public async up(_queryRunner: QueryRunner): Promise<void> {
    return;
  }

  public async down(_queryRunner: QueryRunner): Promise<void> {
    return;
  }
}
