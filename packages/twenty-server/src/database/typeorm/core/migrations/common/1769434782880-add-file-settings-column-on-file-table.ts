import { type MigrationInterface, type QueryRunner } from 'typeorm';

export class AddFileSettingsColumnOnFileTable1769434782880
  implements MigrationInterface
{
  name = 'AddFileSettingsColumnOnFileTable1769434782880';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "core"."file" ADD "settings" jsonb`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "core"."file" DROP COLUMN "settings"`);
  }
}
