import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddIsCustomColumnToIndexMetadata1727699709905
  implements MigrationInterface
{
  name = 'AddIsCustomColumnToIndexMetadata1727699709905';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
          ALTER TABLE "metadata"."indexMetadata" 
          ADD COLUMN "isCustom" BOOLEAN 
          NOT NULL 
          DEFAULT FALSE;
        `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
          ALTER TABLE "metadata"."indexMetadata"
          DROP COLUMN "isCustom"
        `);
  }
}
