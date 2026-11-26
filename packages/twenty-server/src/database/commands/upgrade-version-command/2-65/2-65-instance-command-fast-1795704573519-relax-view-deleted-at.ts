import { QueryRunner } from 'typeorm';

import { RegisteredInstanceCommand } from 'src/engine/core-modules/upgrade/decorators/registered-instance-command.decorator';
import { FastInstanceCommand } from 'src/engine/core-modules/upgrade/interfaces/fast-instance-command.interface';

@RegisteredInstanceCommand('2.65.0', 1795704573519)
export class RelaxViewDeletedAtFastInstanceCommand implements FastInstanceCommand {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `DELETE FROM "core"."viewField" "softDeleted"
        USING "core"."viewField" "other"
        WHERE "softDeleted"."deletedAt" IS NOT NULL
          AND "softDeleted"."isCanonical" = true
          AND "other"."isCanonical" = true
          AND "other"."viewId" = "softDeleted"."viewId"
          AND "other"."fieldMetadataId" = "softDeleted"."fieldMetadataId"
          AND "other"."id" <> "softDeleted"."id"
          AND ("other"."deletedAt" IS NULL OR "other"."id" < "softDeleted"."id")`,
    );
    await queryRunner.query(
      `DELETE FROM "core"."viewSort" "softDeleted"
        USING "core"."viewSort" "other"
        WHERE "softDeleted"."deletedAt" IS NOT NULL
          AND "other"."viewId" = "softDeleted"."viewId"
          AND "other"."fieldMetadataId" = "softDeleted"."fieldMetadataId"
          AND "other"."id" <> "softDeleted"."id"
          AND ("other"."deletedAt" IS NULL OR "other"."id" < "softDeleted"."id")`,
    );
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
