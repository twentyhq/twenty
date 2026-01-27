import { type MigrationInterface, type QueryRunner } from 'typeorm';

export class AddFileInfoColumnOnFileTable1769434782880
  implements MigrationInterface
{
  name = 'AddFileInfoColumnOnFileTable1769434782880';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "core"."file" ADD "info" jsonb`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "core"."file" DROP COLUMN "info"`);
  }
}
