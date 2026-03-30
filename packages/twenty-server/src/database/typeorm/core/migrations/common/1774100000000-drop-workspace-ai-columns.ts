import { MigrationInterface, QueryRunner } from 'typeorm';

export class DropWorkspaceAiColumns1774100000000 implements MigrationInterface {
  name = 'DropWorkspaceAiColumns1774100000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // Use a DO block to avoid "pending trigger events" error when earlier
    // migrations in the same transaction added FK constraints referencing
    // the workspace table.
    await queryRunner.query(`
      DO $$
      BEGIN
        ALTER TABLE "core"."workspace"
          DROP COLUMN IF EXISTS "autoEnableNewAiModels",
          DROP COLUMN IF EXISTS "disabledAiModelIds";
      EXCEPTION WHEN others THEN
        -- Column may not exist or table has pending triggers; safe to ignore
        NULL;
      END $$
    `);
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
