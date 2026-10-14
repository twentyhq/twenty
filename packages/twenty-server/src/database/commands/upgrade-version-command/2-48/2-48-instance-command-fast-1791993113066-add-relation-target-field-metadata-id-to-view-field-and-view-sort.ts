import { QueryRunner } from 'typeorm';

import { RegisteredInstanceCommand } from 'src/engine/core-modules/upgrade/decorators/registered-instance-command.decorator';
import { FastInstanceCommand } from 'src/engine/core-modules/upgrade/interfaces/fast-instance-command.interface';

@RegisteredInstanceCommand('2.48.0', 1791993113066)
export class AddRelationTargetFieldMetadataIdToViewFieldAndViewSortFastInstanceCommand implements FastInstanceCommand {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "core"."viewField" ADD COLUMN IF NOT EXISTS "relationTargetFieldMetadataId" uuid`,
    );
    await queryRunner.query(
      `CREATE INDEX IF NOT EXISTS "IDX_VIEW_FIELD_RELATION_TARGET_FIELD_METADATA_ID" ON "core"."viewField" ("relationTargetFieldMetadataId") WHERE "relationTargetFieldMetadataId" IS NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "core"."viewField" ADD CONSTRAINT "FK_04182cf3303e503661915eb27ee" FOREIGN KEY ("relationTargetFieldMetadataId") REFERENCES "core"."fieldMetadata"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );

    // A view can hold both the relation column and traversed columns on the
    // same relation field, so the pair uniqueness only applies to plain columns
    await queryRunner.query(
      `DROP INDEX IF EXISTS "core"."IDX_VIEW_FIELD_FIELD_METADATA_ID_VIEW_ID_UNIQUE"`,
    );
    await queryRunner.query(
      `CREATE UNIQUE INDEX IF NOT EXISTS "IDX_VIEW_FIELD_FIELD_METADATA_ID_VIEW_ID_UNIQUE" ON "core"."viewField" ("fieldMetadataId", "viewId") WHERE "deletedAt" IS NULL AND "relationTargetFieldMetadataId" IS NULL`,
    );
    await queryRunner.query(
      `CREATE UNIQUE INDEX IF NOT EXISTS "IDX_VIEW_FIELD_FIELD_METADATA_ID_VIEW_ID_RELATION_TARGET_UNIQUE" ON "core"."viewField" ("fieldMetadataId", "viewId", "relationTargetFieldMetadataId") WHERE "deletedAt" IS NULL AND "relationTargetFieldMetadataId" IS NOT NULL`,
    );

    await queryRunner.query(
      `ALTER TABLE "core"."viewSort" ADD COLUMN IF NOT EXISTS "relationTargetFieldMetadataId" uuid`,
    );
    await queryRunner.query(
      `CREATE INDEX IF NOT EXISTS "IDX_VIEW_SORT_RELATION_TARGET_FIELD_METADATA_ID" ON "core"."viewSort" ("relationTargetFieldMetadataId") WHERE "relationTargetFieldMetadataId" IS NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "core"."viewSort" ADD CONSTRAINT "FK_128973737fae365a2db6bba3c49" FOREIGN KEY ("relationTargetFieldMetadataId") REFERENCES "core"."fieldMetadata"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `DROP INDEX IF EXISTS "core"."IDX_VIEW_SORT_FIELD_METADATA_ID_VIEW_ID_UNIQUE"`,
    );
    await queryRunner.query(
      `CREATE UNIQUE INDEX IF NOT EXISTS "IDX_VIEW_SORT_FIELD_METADATA_ID_VIEW_ID_UNIQUE" ON "core"."viewSort" ("fieldMetadataId", "viewId") WHERE "deletedAt" IS NULL AND "relationTargetFieldMetadataId" IS NULL`,
    );
    await queryRunner.query(
      `CREATE UNIQUE INDEX IF NOT EXISTS "IDX_VIEW_SORT_FIELD_METADATA_ID_VIEW_ID_RELATION_TARGET_UNIQUE" ON "core"."viewSort" ("fieldMetadataId", "viewId", "relationTargetFieldMetadataId") WHERE "deletedAt" IS NULL AND "relationTargetFieldMetadataId" IS NOT NULL`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `DROP INDEX IF EXISTS "core"."IDX_VIEW_SORT_FIELD_METADATA_ID_VIEW_ID_RELATION_TARGET_UNIQUE"`,
    );
    await queryRunner.query(
      `DROP INDEX IF EXISTS "core"."IDX_VIEW_SORT_FIELD_METADATA_ID_VIEW_ID_UNIQUE"`,
    );
    await queryRunner.query(
      `CREATE UNIQUE INDEX IF NOT EXISTS "IDX_VIEW_SORT_FIELD_METADATA_ID_VIEW_ID_UNIQUE" ON "core"."viewSort" ("fieldMetadataId", "viewId") WHERE "deletedAt" IS NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "core"."viewSort" DROP CONSTRAINT IF EXISTS "FK_128973737fae365a2db6bba3c49"`,
    );
    await queryRunner.query(
      `DROP INDEX IF EXISTS "core"."IDX_VIEW_SORT_RELATION_TARGET_FIELD_METADATA_ID"`,
    );
    await queryRunner.query(
      `ALTER TABLE "core"."viewSort" DROP COLUMN IF EXISTS "relationTargetFieldMetadataId"`,
    );

    await queryRunner.query(
      `DROP INDEX IF EXISTS "core"."IDX_VIEW_FIELD_FIELD_METADATA_ID_VIEW_ID_RELATION_TARGET_UNIQUE"`,
    );
    await queryRunner.query(
      `DROP INDEX IF EXISTS "core"."IDX_VIEW_FIELD_FIELD_METADATA_ID_VIEW_ID_UNIQUE"`,
    );
    await queryRunner.query(
      `CREATE UNIQUE INDEX IF NOT EXISTS "IDX_VIEW_FIELD_FIELD_METADATA_ID_VIEW_ID_UNIQUE" ON "core"."viewField" ("fieldMetadataId", "viewId") WHERE "deletedAt" IS NULL`,
    );

    await queryRunner.query(
      `ALTER TABLE "core"."viewField" DROP CONSTRAINT IF EXISTS "FK_04182cf3303e503661915eb27ee"`,
    );
    await queryRunner.query(
      `DROP INDEX IF EXISTS "core"."IDX_VIEW_FIELD_RELATION_TARGET_FIELD_METADATA_ID"`,
    );
    await queryRunner.query(
      `ALTER TABLE "core"."viewField" DROP COLUMN IF EXISTS "relationTargetFieldMetadataId"`,
    );
  }
}
