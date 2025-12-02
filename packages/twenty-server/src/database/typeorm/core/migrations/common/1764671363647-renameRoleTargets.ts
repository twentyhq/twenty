import { type MigrationInterface, type QueryRunner } from 'typeorm';

export class RenameRoleTargets1764671363647 implements MigrationInterface {
  name = 'RenameRoleTargets1764671363647';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // Rename table from roleTargets to roleTarget
    await queryRunner.query(
      `ALTER TABLE "core"."roleTargets" RENAME TO "roleTarget"`,
    );

    // Rename unique constraints
    await queryRunner.query(
      `ALTER TABLE "core"."roleTarget" RENAME CONSTRAINT "IDX_ROLE_TARGETS_UNIQUE_USER_WORKSPACE" TO "IDX_ROLE_TARGET_UNIQUE_USER_WORKSPACE"`,
    );
    await queryRunner.query(
      `ALTER TABLE "core"."roleTarget" RENAME CONSTRAINT "IDX_ROLE_TARGETS_UNIQUE_AGENT" TO "IDX_ROLE_TARGET_UNIQUE_AGENT"`,
    );
    await queryRunner.query(
      `ALTER TABLE "core"."roleTarget" RENAME CONSTRAINT "IDX_ROLE_TARGETS_UNIQUE_API_KEY" TO "IDX_ROLE_TARGET_UNIQUE_API_KEY"`,
    );

    // Rename check constraint
    await queryRunner.query(
      `ALTER TABLE "core"."roleTarget" RENAME CONSTRAINT "CHK_role_targets_single_entity" TO "CHK_role_target_single_entity"`,
    );

    // Rename indexes
    await queryRunner.query(
      `ALTER INDEX "core"."IDX_ROLE_TARGETS_WORKSPACE_ID" RENAME TO "IDX_ROLE_TARGET_WORKSPACE_ID"`,
    );
    await queryRunner.query(
      `ALTER INDEX "core"."IDX_ROLE_TARGETS_AGENT_ID" RENAME TO "IDX_ROLE_TARGET_AGENT_ID"`,
    );
    await queryRunner.query(
      `ALTER INDEX "core"."IDX_ROLE_TARGETS_API_KEY_ID" RENAME TO "IDX_ROLE_TARGET_API_KEY_ID"`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Rename indexes back
    await queryRunner.query(
      `ALTER INDEX "core"."IDX_ROLE_TARGET_API_KEY_ID" RENAME TO "IDX_ROLE_TARGETS_API_KEY_ID"`,
    );
    await queryRunner.query(
      `ALTER INDEX "core"."IDX_ROLE_TARGET_AGENT_ID" RENAME TO "IDX_ROLE_TARGETS_AGENT_ID"`,
    );
    await queryRunner.query(
      `ALTER INDEX "core"."IDX_ROLE_TARGET_WORKSPACE_ID" RENAME TO "IDX_ROLE_TARGETS_WORKSPACE_ID"`,
    );

    // Rename check constraint back
    await queryRunner.query(
      `ALTER TABLE "core"."roleTarget" RENAME CONSTRAINT "CHK_role_target_single_entity" TO "CHK_role_targets_single_entity"`,
    );

    // Rename unique constraints back
    await queryRunner.query(
      `ALTER TABLE "core"."roleTarget" RENAME CONSTRAINT "IDX_ROLE_TARGET_UNIQUE_API_KEY" TO "IDX_ROLE_TARGETS_UNIQUE_API_KEY"`,
    );
    await queryRunner.query(
      `ALTER TABLE "core"."roleTarget" RENAME CONSTRAINT "IDX_ROLE_TARGET_UNIQUE_AGENT" TO "IDX_ROLE_TARGETS_UNIQUE_AGENT"`,
    );
    await queryRunner.query(
      `ALTER TABLE "core"."roleTarget" RENAME CONSTRAINT "IDX_ROLE_TARGET_UNIQUE_USER_WORKSPACE" TO "IDX_ROLE_TARGETS_UNIQUE_USER_WORKSPACE"`,
    );

    // Rename table back
    await queryRunner.query(
      `ALTER TABLE "core"."roleTarget" RENAME TO "roleTargets"`,
    );
  }
}
