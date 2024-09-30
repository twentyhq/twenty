import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddIsCustomColumnToIndexMetadata1727699709905
  implements MigrationInterface
{
  name = 'AddIsCustom1727699709905';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
          ALTER TABLE "metadata"."indexMetadata"
          ADD COLUMN "isCustom" BOOLEAN
        `);

    await queryRunner.query(`
          UPDATE "metadata"."indexMetadata"
          SET "isCustom" = false
        `);

    await queryRunner.query(`
          ALTER TABLE "metadata"."indexMetadata"
          ALTER COLUMN "isCustom" SET NOT NULL
        `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
          ALTER TABLE "metadata"."indexMetadata"
          DROP COLUMN "isCustom"
        `);
  }
}
