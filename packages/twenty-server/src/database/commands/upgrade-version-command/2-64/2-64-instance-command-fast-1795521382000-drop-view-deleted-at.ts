import { type QueryRunner } from 'typeorm';

import { RegisteredInstanceCommand } from 'src/engine/core-modules/upgrade/decorators/registered-instance-command.decorator';
import { type FastInstanceCommand } from 'src/engine/core-modules/upgrade/interfaces/fast-instance-command.interface';

const VIEW_TABLE_NAMES = [
  'view',
  'viewField',
  'viewFieldGroup',
  'viewFilter',
  'viewFilterGroup',
  'viewGroup',
  'viewSort',
];

@RegisteredInstanceCommand('2.64.0', 1795521382000)
export class DropViewDeletedAtFastInstanceCommand implements FastInstanceCommand {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      'DROP INDEX IF EXISTS "core"."IDX_VIEW_FIELD_FIELD_METADATA_ID_VIEW_ID_UNIQUE"',
    );
    await queryRunner.query(
      'DROP INDEX IF EXISTS "core"."IDX_VIEW_SORT_FIELD_METADATA_ID_VIEW_ID_UNIQUE"',
    );

    for (const tableName of VIEW_TABLE_NAMES) {
      await queryRunner.query(
        `ALTER TABLE "core"."${tableName}" DROP COLUMN IF EXISTS "deletedAt"`,
      );
    }

    await queryRunner.query(
      'CREATE UNIQUE INDEX IF NOT EXISTS "IDX_VIEW_FIELD_FIELD_METADATA_ID_VIEW_ID_UNIQUE" ON "core"."viewField" ("fieldMetadataId", "viewId") WHERE "isCanonical" = true',
    );
    await queryRunner.query(
      'CREATE UNIQUE INDEX IF NOT EXISTS "IDX_VIEW_SORT_FIELD_METADATA_ID_VIEW_ID_UNIQUE" ON "core"."viewSort" ("fieldMetadataId", "viewId")',
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      'DROP INDEX IF EXISTS "core"."IDX_VIEW_FIELD_FIELD_METADATA_ID_VIEW_ID_UNIQUE"',
    );
    await queryRunner.query(
      'DROP INDEX IF EXISTS "core"."IDX_VIEW_SORT_FIELD_METADATA_ID_VIEW_ID_UNIQUE"',
    );

    for (const tableName of VIEW_TABLE_NAMES) {
      await queryRunner.query(
        `ALTER TABLE "core"."${tableName}" ADD COLUMN IF NOT EXISTS "deletedAt" TIMESTAMP WITH TIME ZONE`,
      );
    }

    await queryRunner.query(
      'CREATE UNIQUE INDEX IF NOT EXISTS "IDX_VIEW_FIELD_FIELD_METADATA_ID_VIEW_ID_UNIQUE" ON "core"."viewField" ("fieldMetadataId", "viewId") WHERE "deletedAt" IS NULL AND "isCanonical" = true',
    );
    await queryRunner.query(
      'CREATE UNIQUE INDEX IF NOT EXISTS "IDX_VIEW_SORT_FIELD_METADATA_ID_VIEW_ID_UNIQUE" ON "core"."viewSort" ("fieldMetadataId", "viewId") WHERE "deletedAt" IS NULL',
    );
  }
}
