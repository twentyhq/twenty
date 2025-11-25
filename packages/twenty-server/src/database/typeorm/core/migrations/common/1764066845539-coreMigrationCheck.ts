import { type MigrationInterface, type QueryRunner } from 'typeorm';

export class CoreMigrationCheck1764066845539 implements MigrationInterface {
  name = 'CoreMigrationCheck1764066845539';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "core"."agent" ALTER COLUMN "modelId" SET DEFAULT 'default-smart-model'`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "core"."agent" ALTER COLUMN "modelId" SET DEFAULT 'auto'`,
    );
  }
}
