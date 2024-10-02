import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddIndexTypeColumnToIndexMetadata1725893697807
  implements MigrationInterface
{
  name = 'AddIndexTypeColumnToIndexMetadata1725893697807';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TYPE metadata.INDEX_TYPES AS ENUM ('BTREE', 'GIN')`,
    );

    await queryRunner.query(`
      ALTER TABLE metadata."indexMetadata" 
      ADD COLUMN "indexType" metadata.INDEX_TYPES DEFAULT 'BTREE'
    `);

    await queryRunner.query(`
      UPDATE metadata."indexMetadata"
      SET "indexType" = 'BTREE'
      WHERE "indexType" IS NULL
    `);

    await queryRunner.query(`
      ALTER TABLE metadata."indexMetadata" 
      ALTER COLUMN "indexType" SET NOT NULL
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE metadata."indexMetadata" 
      ALTER COLUMN "indexType" DROP NOT NULL
    `);

    await queryRunner.query(`
      ALTER TABLE metadata."indexMetadata" DROP COLUMN "indexType"
    `);

    await queryRunner.query(`DROP TYPE metadata.INDEX_TYPES`);
  }
}
