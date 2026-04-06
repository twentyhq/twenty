import { type MigrationInterface, type QueryRunner } from 'typeorm';

export class AddViewFieldGroupIdIndexOnViewField1775129420309
  implements MigrationInterface
{
  name = 'AddViewFieldGroupIdIndexOnViewField1775129420309';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE INDEX IF NOT EXISTS "IDX_VIEW_FIELD_VIEW_FIELD_GROUP_ID" ON "core"."viewField" ("viewFieldGroupId")`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `DROP INDEX IF EXISTS "core"."IDX_VIEW_FIELD_VIEW_FIELD_GROUP_ID"`,
    );
  }
}
