import { type MigrationInterface, type QueryRunner } from 'typeorm';

export class AddMimeTypeToFileTable1770814914548 implements MigrationInterface {
  name = 'AddMimeTypeToFileTable1770814914548';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "core"."file" ADD "mimeType" character varying NOT NULL DEFAULT 'application/octet-stream'`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "core"."file" DROP COLUMN "mimeType"`);
  }
}
