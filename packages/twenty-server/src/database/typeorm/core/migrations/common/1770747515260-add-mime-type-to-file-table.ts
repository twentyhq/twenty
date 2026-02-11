import { type MigrationInterface, type QueryRunner } from 'typeorm';

export class AddMimeTypeToFileTable1770747515260 implements MigrationInterface {
  name = 'AddMimeTypeToFileTable1770747515260';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "core"."file" ADD "mimeType" character varying`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "core"."file" DROP COLUMN "mimeType"`);
  }
}
