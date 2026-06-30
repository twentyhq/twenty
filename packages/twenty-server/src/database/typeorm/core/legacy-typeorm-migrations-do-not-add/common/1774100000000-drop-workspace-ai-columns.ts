import { MigrationInterface, QueryRunner } from 'typeorm';

export class DropWorkspaceAiColumns1774100000000 implements MigrationInterface {
  name = 'DropWorkspaceAiColumns1774100000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "core"."workspace" DROP COLUMN IF EXISTS "autoEnableNewAiModels"`,
    );
    await queryRunner.query(
      `ALTER TABLE "core"."workspace" DROP COLUMN IF EXISTS "disabledAiModelIds"`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "core"."workspace" ADD "disabledAiModelIds" character varying array NOT NULL DEFAULT '{}'`,
    );
    await queryRunner.query(
      `ALTER TABLE "core"."workspace" ADD "autoEnableNewAiModels" boolean NOT NULL DEFAULT true`,
    );
  }
}
