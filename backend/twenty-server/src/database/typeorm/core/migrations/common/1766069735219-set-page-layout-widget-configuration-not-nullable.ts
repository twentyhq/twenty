import { type MigrationInterface, type QueryRunner } from 'typeorm';

export class CoreMigrationCheck1766069735219 implements MigrationInterface {
  name = 'CoreMigrationCheck1766069735219';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "core"."pageLayoutWidget" ALTER COLUMN "configuration" SET NOT NULL`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "core"."pageLayoutWidget" ALTER COLUMN "configuration" DROP NOT NULL`,
    );
  }
}
