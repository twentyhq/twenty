import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddIndexType1725893697807 implements MigrationInterface {
  name = 'AddIndexType1725893697807';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TYPE "core"."indexMetadata_indextype_enum" AS ENUM('BTREE', 'GIN')`,
    );

    await queryRunner.query(`
      ALTER TABLE "core"."indexMetadata" 
      ADD COLUMN "indexType" "core"."indexMetadata_indextype_enum" NOT NULL DEFAULT 'BTREE';
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE "core"."indexMetadata" DROP COLUMN "indexType"
    `);

    await queryRunner.query(`DROP TYPE "core"."indexMetadata_indextype_enum"`);
  }
}
