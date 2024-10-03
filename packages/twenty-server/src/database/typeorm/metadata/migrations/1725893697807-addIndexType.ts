import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddIndexType1725893697807 implements MigrationInterface {
  name = 'AddIndexType1725893697807';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TYPE "metadata"."indexMetadata_indextype_enum" AS ENUM('BTREE', 'GIN')`,
    );

    await queryRunner.query(`
      ALTER TABLE metadata."indexMetadata" 
      ADD COLUMN "indexType" metadata."indexMetadata_indextype_enum" NOT NULL DEFAULT 'BTREE';
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE metadata."indexMetadata" DROP COLUMN "indexType"
    `);

    await queryRunner.query(
      `DROP TYPE metadata."indexMetadata_indextype_enum"`,
    );
  }
}
