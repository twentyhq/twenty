import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddViewFieldSubFieldName1774500000000
  implements MigrationInterface
{
  name = 'AddViewFieldSubFieldName1774500000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "core"."viewField" ADD COLUMN "subFieldName" varchar NULL`,
    );

    // Drop the old unique index (fieldMetadataId, viewId)
    await queryRunner.query(
      `DROP INDEX IF EXISTS "core"."IDX_VIEW_FIELD_FIELD_METADATA_ID_VIEW_ID_UNIQUE"`,
    );

    // Create new unique index that includes subFieldName (COALESCE handles nulls)
    await queryRunner.query(
      `CREATE UNIQUE INDEX "IDX_VIEW_FIELD_FIELD_METADATA_ID_VIEW_ID_UNIQUE"
       ON "core"."viewField" ("fieldMetadataId", "viewId", COALESCE("subFieldName", ''))
       WHERE "deletedAt" IS NULL`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `DROP INDEX IF EXISTS "core"."IDX_VIEW_FIELD_FIELD_METADATA_ID_VIEW_ID_UNIQUE"`,
    );

    await queryRunner.query(
      `CREATE UNIQUE INDEX "IDX_VIEW_FIELD_FIELD_METADATA_ID_VIEW_ID_UNIQUE"
       ON "core"."viewField" ("fieldMetadataId", "viewId")
       WHERE "deletedAt" IS NULL`,
    );

    await queryRunner.query(
      `ALTER TABLE "core"."viewField" DROP COLUMN "subFieldName"`,
    );
  }
}
